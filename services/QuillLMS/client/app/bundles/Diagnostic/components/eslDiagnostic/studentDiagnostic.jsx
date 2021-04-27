import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import { withNamespaces } from 'react-i18next';

import PlaySentenceFragment from './sentenceFragment.jsx';
import PlayDiagnosticQuestion from './sentenceCombining.jsx';
import LandingPage from './landingPage.jsx';
import LanguagePage from './languagePage.jsx';
import PlayTitleCard from './titleCard.tsx'
import FinishedDiagnostic from './finishedDiagnostic.jsx';
import Footer from './footer'

import {
  CarouselAnimation,
  ProgressBar
} from '../../../Shared/index';
import {
  clearData,
  loadData,
  nextQuestion,
  nextQuestionWithoutSaving,
  submitResponse,
  updateCurrentQuestion,
  resumePreviousDiagnosticSession,
  updateLanguage,
  setDiagnosticID,
  openLanguageMenu,
  setCurrentQuestion
} from '../../actions/diagnostics.js';
import SessionActions from '../../actions/sessions.js';
import PlayFillInTheBlankQuestion from '../fillInBlank/playFillInTheBlankQuestion'
import { getConceptResultsForAllQuestions } from '../../libs/conceptResults/diagnostic';
import {
  questionCount,
  answeredQuestionCount,
  getProgressPercent
} from '../../libs/calculateProgress'
import { getParameterByName } from '../../libs/getParameterByName';
import i18n from '../../i18n';
import { ENGLISH } from '../../modules/translation/languagePageInfo';

const request = require('request');

export class ELLStudentDiagnostic extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      saved: false,
      sessionID: this.getSessionId(),
      hasOrIsGettingResponses: false,
    }
  }

  componentDidMount() {
    const { dispatch, match, lessons } = this.props
    const { sessionID, } = this.state
    const { params } = match;
    const { diagnosticID } = params;

    document.title = `Quill.org | ${lessons.data[diagnosticID].name}`

    dispatch(clearData());
    dispatch(setDiagnosticID({ diagnosticID: match.params.diagnosticID, }))
    if (sessionID) {
      SessionActions.get(sessionID, (data) => {
        this.setState({ session: data, });
      });
    }
    const data = this.getFetchedData()
    const action = loadData(data);
    dispatch(action);
  }

  componentDidUpdate(prevProps) {
    const { previewMode, skippedToQuestionFromIntro, questionToPreview, playDiagnostic, } = this.props;

    if(prevProps.skippedToQuestionFromIntro !== skippedToQuestionFromIntro && previewMode && questionToPreview) {
      this.startActivity();
    }
    if (prevProps.playDiagnostic.answeredQuestions.length !== playDiagnostic.answeredQuestions.length) {
      this.saveSessionData(playDiagnostic);
    }
  }

  getPreviousSessionData = () => {
    const { session, } = this.state
    return session;
  }

  resumeSession = (data) => {
    const { dispatch, } = this.props
    if (data) {
      dispatch(resumePreviousDiagnosticSession(data));
    }
  }

  getSessionId = () => {
    let sessionID = getParameterByName('student');
    if (sessionID === 'null') {
      sessionID = undefined;
    }
    return sessionID;
  }

  saveSessionData = (lessonData) => {
    const { sessionID, } = this.state

    if (sessionID) {
      SessionActions.update(sessionID, lessonData);
    }
  }

  saveToLMS = () => {
    const { match, playDiagnostic, } = this.props;
    const { params } = match;
    const { diagnosticID } = params;

    const { sessionID, } = this.state

    this.setState({ error: false, });
    const results = getConceptResultsForAllQuestions(playDiagnostic.answeredQuestions);

    if (sessionID) {
      this.finishActivitySession(sessionID, results, 1);
    } else {
      this.createAnonActivitySession(diagnosticID, results, 1);
    }
  }

  finishActivitySession = (sessionID, results, score) => {
    request(
      { url: `${process.env.DEFAULT_URL}/api/v1/activity_sessions/${sessionID}`,
        method: 'PUT',
        json:
        {
          state: 'finished',
          concept_results: results,
          percentage: score,
        },
      }, (err, httpResponse, body) => {
        if (httpResponse && httpResponse.statusCode === 200) {
          // to do, use Sentry to capture error
          SessionActions.delete(sessionID);
          document.location.href = process.env.DEFAULT_URL
          this.setState({ saved: true, });
        } else {
          this.setState({
            saved: false,
            error: body.meta.message,
          });
        }
      }
    );
  }

  createAnonActivitySession = (diagnosticID, results, score) => {
    request(
      { url: `${process.env.DEFAULT_URL}/api/v1/activity_sessions/`,
        method: 'POST',
        json:
        {
          state: 'finished',
          activity_uid: diagnosticID,
          concept_results: results,
          percentage: score,
        },
      }, (err, httpResponse, body) => {
        if (httpResponse && httpResponse.statusCode === 200) {
          // to do, use Sentry to capture error
          document.location.href = process.env.DEFAULT_URL
          this.setState({ saved: true, });
        }
      }
    );
  }

  submitResponse = (response) => {
    const { dispatch, } = this.props

    const action = submitResponse(response);
    dispatch(action);
  }

  renderQuestionComponent = () => {
    const { playDiagnostic, dispatch, match, t, previewMode } = this.props
    const { params } = match;
    const { diagnosticID } = params;

    const isLastQuestion = playDiagnostic.unansweredQuestions.length === 0

    let component
    if (playDiagnostic.currentQuestion.type === 'SC') {
      component = (<PlayDiagnosticQuestion
        diagnosticID={diagnosticID}
        dispatch={dispatch}
        isLastQuestion={isLastQuestion}
        key={playDiagnostic.currentQuestion.data.key}
        language={this.language()}
        marking="diagnostic"
        nextQuestion={this.nextQuestion}
        previewMode={previewMode}
        question={playDiagnostic.currentQuestion.data}
        translate={t}
      />);
    } else if (playDiagnostic.currentQuestion.type === 'SF') {
      component = (<PlaySentenceFragment
        currentKey={playDiagnostic.currentQuestion.data.key}
        dispatch={dispatch}
        isLastQuestion={isLastQuestion}
        key={playDiagnostic.currentQuestion.data.key}
        language={this.language()}
        markIdentify={this.markIdentify}
        nextQuestion={this.nextQuestion}
        previewMode={previewMode}
        question={playDiagnostic.currentQuestion.data}
        updateAttempts={this.submitResponse}
      />);
    } else if (playDiagnostic.currentQuestion.type === 'TL') {
      component = (
        <PlayTitleCard
          currentKey={playDiagnostic.currentQuestion.data.key}
          data={playDiagnostic.currentQuestion.data}
          dispatch={dispatch}
          handleContinueClick={this.nextQuestionWithoutSaving}
          isLastQuestion={isLastQuestion}
          key={playDiagnostic.currentQuestion.data.key}
          language={this.language()}
          previewMode={previewMode}
          translate={t}
        />
      );
    } else if (playDiagnostic.currentQuestion.type === 'FB') {
      component = (
        <PlayFillInTheBlankQuestion
          currentKey={playDiagnostic.currentQuestion.data.key}
          diagnosticID={diagnosticID}
          dispatch={dispatch}
          key={playDiagnostic.currentQuestion.data.key}
          language={this.language()}
          nextQuestion={this.nextQuestion}
          previewMode={previewMode}
          question={playDiagnostic.currentQuestion.data}
          translate={t}
        />
      );
    }
    return component
  }

  startActivity = () => {
    const { dispatch, previewMode, skippedToQuestionFromIntro, questionToPreview } = this.props

    const data = this.getFetchedData()
    const action = loadData(data);
    dispatch(action);
    // when user skips to question from the landing page, we set the current question here in this one instance and default lanugage to English
    if(previewMode && skippedToQuestionFromIntro && questionToPreview) {
      if(!this.language()) {
        this.updateLanguage(ENGLISH);
      }
      const action = setCurrentQuestion(questionToPreview);
      dispatch(action);
    } else {
      const next = nextQuestion();
      dispatch(next);
    }
  }

  nextQuestion = () => {
    const { dispatch, playDiagnostic, previewMode } = this.props;
    const { unansweredQuestions } = playDiagnostic;
    // we set the current question here; otherwise, the attempts will be reset if the next question has already been answered
    if(previewMode) {
      const question = unansweredQuestions[0].data;
      const action = setCurrentQuestion(question);
      dispatch(action);
    } else {
      const next = nextQuestion();
      dispatch(next);
    }
  }

  nextQuestionWithoutSaving = () => {
    const { dispatch, playDiagnostic, previewMode } = this.props;
    const { unansweredQuestions } = playDiagnostic;
    // we set the current question here; otherwise, the attempts will be reset if the next question has already been answered
    if(previewMode) {
      const question = unansweredQuestions[0].data;
      const action = setCurrentQuestion(question);
      dispatch(action);
    } else {
      const next = nextQuestionWithoutSaving();
      dispatch(next);
    }
  }

  getLesson = () => {
    const { lessons, match } = this.props;
    const { params } = match;
    const { diagnosticID } = params;
    return lessons.data[diagnosticID];
  }

  markIdentify = (bool) => {
    const { dispatch, } = this.props
    const action = updateCurrentQuestion({ identified: bool, });
    dispatch(action);
  }

  getFetchedData = () => {
    const lesson = this.getLesson()
    if (lesson) {
      const filteredQuestions = lesson.questions.filter((ques) => {
        return this.props[ques.questionType] ? this.props[ques.questionType].data[ques.key] : null  // eslint-disable-line react/destructuring-assignment
      });
      // this is a quickfix for missing questions -- if we leave this in here
      // long term, we should return an array through a forloop to
      // cut the time from 2N to N
      return filteredQuestions.map((questionItem) => {
        const questionType = questionItem.questionType;
        const key = questionItem.key;
        const question = this.props[questionType].data[key]; // eslint-disable-line react/destructuring-assignment
        question.key = key;
        question.attempts = question.attempts ? question.attempts : []
        let type
        switch (questionType) {
          case 'questions':
          type = 'SC'
          break
          case 'fillInBlank':
          type = 'FB'
          break
          case 'titleCards':
          type = 'TL'
          break
          case 'sentenceFragments':
          default:
          type = 'SF'
        }
        return { type, data: question, };
      });
    }
  }

  updateLanguage = (language) => {
    const { dispatch, } = this.props
    i18n.changeLanguage(language);
    dispatch(updateLanguage(language));
  }

  onClickOpenMobileLanguageMenu = () => {
    const { dispatch, } = this.props
    dispatch(openLanguageMenu())
    window.scrollTo(0, 0)
  }

  language = () => {
    const { playDiagnostic, } = this.props

    return playDiagnostic.language;
  }

  landingPageHtml = () => {
    const { lessons, match } = this.props;
    const { data } = lessons;
    const { params } = match;
    const { diagnosticID } = params;
    return data[diagnosticID].landingPageHtml
  }

  renderFooter = () => {
    if (!this.language()) { return }

    return (<Footer
      handleClickOpenMobileLanguageMenu={this.onClickOpenMobileLanguageMenu}
      language={this.language()}
      updateLanguage={this.updateLanguage}
    />)
  }

  renderProgressBar = () => {
    const { playDiagnostic, } = this.props
    if (!playDiagnostic.currentQuestion) { return }

    const calculatedAnsweredQuestionCount = answeredQuestionCount(playDiagnostic)

    const currentQuestionIsTitleCard = playDiagnostic.currentQuestion.type === 'TL'
    const currentQuestionIsNotFirstQuestion = calculatedAnsweredQuestionCount !== 0

    const displayedAnsweredQuestionCount = currentQuestionIsTitleCard && currentQuestionIsNotFirstQuestion ? calculatedAnsweredQuestionCount + 1 : calculatedAnsweredQuestionCount

    const progressPercent = getProgressPercent(playDiagnostic);
    const totalQuestionCount = questionCount(playDiagnostic);

    return (<ProgressBar
      answeredQuestionCount={displayedAnsweredQuestionCount > totalQuestionCount ? totalQuestionCount : displayedAnsweredQuestionCount}
      label='questions'
      percent={progressPercent}
      questionCount={totalQuestionCount}
    />)
  }

  render() {
    const { error, saved, } = this.state
    const { dispatch, match, playDiagnostic, t, previewMode } = this.props;
    const { params } = match;
    const { diagnosticID } = params;

    let component;
    const minusHowMuch = this.language() ? 'minus-nav-and-footer' : 'minus-nav'

    if (playDiagnostic.currentQuestion) {
      component = this.renderQuestionComponent();
    } else if (playDiagnostic.answeredQuestions.length > 0 && playDiagnostic.unansweredQuestions.length === 0) {
      component = (<FinishedDiagnostic
        error={error}
        language={this.language()}
        saved={saved}
        saveToLMS={this.saveToLMS}
        translate={t}
      />);
    } else if (playDiagnostic.language && !previewMode) {
      component = (<LandingPage
        begin={this.startActivity}
        diagnosticID={diagnosticID}
        landingPageHtml={this.landingPageHtml()}
        language={this.language()}
        resumeActivity={this.resumeSession}
        session={this.getPreviousSessionData()}
        translate={t}

      />);
    } else {
      component = (<LanguagePage
        begin={this.startActivity}
        diagnosticID={diagnosticID}
        dispatch={dispatch}
        previewMode={previewMode}
        setLanguage={this.updateLanguage}
      />);
    }
    return (
      <div className="ell-diagnostic-container">
        <section className={`section is-fullheight student ${minusHowMuch}`}>
          {this.renderProgressBar()}
          <div className="student-container student-container-diagnostic">
            <CarouselAnimation>
              {component}
            </CarouselAnimation>
          </div>
        </section>
        {this.renderFooter()}
      </div>
    );
  }
}

function select(state) {
  return {
    routing: state.routing,
    questions: state.questions,
    playDiagnostic: state.playDiagnostic,
    sentenceFragments: state.sentenceFragments,
    fillInBlank: state.fillInBlank,
    sessions: state.sessions,
    lessons: state.lessons,
    titleCards: state.titleCards
  };
}
export default withNamespaces()(connect(select)(ELLStudentDiagnostic));
