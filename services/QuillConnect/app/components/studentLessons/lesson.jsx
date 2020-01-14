import React from 'react';
import { connect } from 'react-redux';
import PlayLessonQuestion from './question';
import PlaySentenceFragment from './sentenceFragment.jsx';
import PlayFillInTheBlankQuestion from './fillInBlank.tsx'
import {
  PlayTitleCard,
  Register,
  Spinner
} from 'quill-component-library/dist/componentLibrary'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { clearData, loadData, nextQuestion, submitResponse, updateName, updateCurrentQuestion, resumePreviousSession } from '../../actions.js';
import SessionActions from '../../actions/sessions.js';
import _ from 'underscore';
import { getConceptResultsForAllQuestions, calculateScoreForLesson } from '../../libs/conceptResults/lesson';
import Finished from './finished.jsx';
import { getParameterByName } from '../../libs/getParameterByName';
import { permittedFlag } from '../../libs/flagArray'

const request = require('request');

class Lesson extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hasOrIsGettingResponses: false,
      sessionInitialized: false
    }
  }

  componentWillMount() {
    this.props.dispatch(clearData());
  }

  componentWillReceiveProps(nextProps) {
    const answeredQuestionsHasChanged = nextProps.playLesson.answeredQuestions.length !== this.props.playLesson.answeredQuestions.length
    const nextPropsAttemptsLength = nextProps.playLesson.currentQuestion && nextProps.playLesson.currentQuestion.question ? nextProps.playLesson.currentQuestion.question.attempts.length : 0
    const thisPropsAttemptsLength = this.props.playLesson.currentQuestion && this.props.playLesson.currentQuestion.question ? this.props.playLesson.currentQuestion.question.attempts.length : 0
    const attemptsHasChanged = nextPropsAttemptsLength !== thisPropsAttemptsLength
    if (answeredQuestionsHasChanged || attemptsHasChanged) {
      this.saveSessionData(nextProps.playLesson);
    }
  }

  componentDidUpdate() {
    // At mount time the component may still be waiting on questions
    // to be retrieved, so we need to do checks on component update
    if (this.props.questions.hasreceiveddata &&
        this.props.fillInBlank.hasreceiveddata &&
        this.props.sentenceFragments.hasreceiveddata &&
        this.props.titleCards.hasreceiveddata) {
      // This function will bail early if it has already set question data
      // so it is safe to call repeatedly
      SessionActions.populateQuestions("SC", this.props.questions.data);
      SessionActions.populateQuestions("FB", this.props.fillInBlank.data);
      SessionActions.populateQuestions("SF", this.props.sentenceFragments.data);
      SessionActions.populateQuestions("TL", this.props.titleCards.data);
      // This used to be an DidMount call, but we can't safely call it
      // until the Session module has received Question data, so now
      // we check if the value has been initalized, and if not we do so now
      if (!this.state.sessionInitialized) {
        this.saveSessionIdToState();
      }
    }
  }

  doesNotHaveAndIsNotGettingResponses = () => {
    return (!this.state.hasOrIsGettingResponses);
  }

  getPreviousSessionData = () => {
    return this.state.session;
  }

  resumeSession = (data) => {
    if (data) {
      this.props.dispatch(resumePreviousSession(data));
    }
  }

  hasQuestionsInQuestionSet = (props) => {
    const pL = props.playLesson;
    return (pL && pL.questionSet && pL.questionSet.length);
  }

  saveSessionIdToState = () => {
    let sessionID = getParameterByName('student');
    if (sessionID === 'null') {
      sessionID = undefined;
    }
    this.setState({ sessionID, sessionInitialized: true}, () => {
      if (sessionID) {
        SessionActions.get(this.state.sessionID, (data) => {
          this.setState({ session: data, });
        });
      }
    });
  }

  submitResponse = (response) => {
    const action = submitResponse(response);
    this.props.dispatch(action);
  }

  saveToLMS = () => {
    this.setState({ error: false, });
    const relevantAnsweredQuestions = this.props.playLesson.answeredQuestions.filter(q => q.questionType !== 'TL')
    const results = getConceptResultsForAllQuestions(relevantAnsweredQuestions);
    const score = calculateScoreForLesson(relevantAnsweredQuestions);
    const { lessonID, } = this.props.params;
    const sessionID = this.state.sessionID;
    if (sessionID) {
      this.finishActivitySession(sessionID, results, score);
    } else {
      this.createAnonActivitySession(lessonID, results, score);
    }
  }

  finishActivitySession = (sessionID, results, score) => {
    request(
      { url: `${process.env.EMPIRICAL_BASE_URL}/api/v1/activity_sessions/${sessionID}`,
        method: 'PUT',
        json:
        {
          state: 'finished',
          concept_results: results,
          percentage: score,
        }
      },
      (err, httpResponse, body) => {
        if (httpResponse && httpResponse.statusCode === 200) {
          // to do, use Sentry to capture error
          SessionActions.delete(this.state.sessionID);
          document.location.href = `${process.env.EMPIRICAL_BASE_URL}/activity_sessions/${this.state.sessionID}`;
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

  markIdentify = (bool) => {
    const action = updateCurrentQuestion({ identified: bool, });
    this.props.dispatch(action);
  }

  createAnonActivitySession = (lessonID, results, score) => {
    request(
      { url: `${process.env.EMPIRICAL_BASE_URL}/api/v1/activity_sessions/`,
        method: 'POST',
        json:
        {
          state: 'finished',
          activity_uid: lessonID,
          concept_results: results,
          percentage: score,
        }
      },
      (err, httpResponse, body) => {
        if (httpResponse && httpResponse.statusCode === 200) {
          // to do, use Sentry to capture error
          document.location.href = `${process.env.EMPIRICAL_BASE_URL}/activity_sessions/${body.activity_session.uid}`;
          this.setState({ saved: true, });
        }
      }
    );
  }

  questionsForLesson = () => {
    const { data, } = this.props.lessons
    const { lessonID, } = this.props.params;
    const filteredQuestions = data[lessonID].questions.filter((ques) => {
      const question = this.props[ques.questionType].data[ques.key]
      return question && permittedFlag(data[lessonID].flag, question.flag)
    }
    );
    // this is a quickfix for missing questions -- if we leave this in here
    // long term, we should return an array through a forloop to
    // cut the time from 2N to N
    return filteredQuestions.map((questionItem) => {
      const questionType = questionItem.questionType;
      const key = questionItem.key;
      const question = this.props[questionType].data[key];
      question.key = key;
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
      return { type, question, };
    });
  }

  startActivity = (name) => {
    this.saveStudentName(name);
    const action = loadData(this.questionsForLesson());
    this.props.dispatch(action);
    const next = nextQuestion();
    this.props.dispatch(next);
  }

  nextQuestion = () => {
    const next = nextQuestion();
    return this.props.dispatch(next);
  }

  getLesson = () => {
    return this.props.lessons.data[this.props.params.lessonID];
  }

  getLessonName = () => {
    return this.props.lessons.data[this.props.params.lessonID].name;
  }

  saveStudentName(name) {
    this.props.dispatch(updateName(name));
  }

  getProgressPercent = () => {
    if (this.props.playLesson && this.props.playLesson.answeredQuestions && this.props.playLesson.questionSet) {
      return this.props.playLesson.answeredQuestions.length / this.props.playLesson.questionSet.length * 100;
    } else {
      return 0;
    }
  }

  saveSessionData = (lessonData) => {
    if (this.state.sessionID) {
      SessionActions.update(this.state.sessionID, lessonData);
    }
  }

  render() {
    const { conceptsFeedback, playLesson, dispatch, lessons, params, } = this.props
    const { data, hasreceiveddata, } = lessons
    const { lessonID, } = params;
    let component;

    if (!(this.state.sessionInitialized && hasreceiveddata && data && data[lessonID])) {
      return (<div className="student-container student-container-diagnostic"><Spinner /></div>);
    }

    if (playLesson.currentQuestion) {
      const { type, question, } = playLesson.currentQuestion;
      if (type === 'SF') {
        component = (
          <PlaySentenceFragment
            conceptsFeedback={conceptsFeedback}
            currentKey={question.key}
            dispatch={dispatch}
            key={question.key}
            markIdentify={this.markIdentify}
            marking="diagnostic"
            nextQuestion={this.nextQuestion}
            question={question}
            updateAttempts={this.submitResponse}
          />
        );
      } else if (type === 'FB') {
        component = (
          <PlayFillInTheBlankQuestion
            conceptsFeedback={conceptsFeedback}
            dispatch={dispatch}
            key={question.key}
            nextQuestion={this.nextQuestion}
            prefill={this.getLesson().prefill}
            question={question}
            submitResponse={this.submitResponse}
          />
        );
      } else if (type === 'TL'){
        component = (
          <PlayTitleCard
            data={question}
            nextQuestion={this.nextQuestion}
          />
        )
      } else {
        component = (
          <PlayLessonQuestion
            conceptsFeedback={conceptsFeedback}
            dispatch={dispatch}
            key={question.key}
            nextQuestion={this.nextQuestion}
            prefill={this.getLesson().prefill}
            question={question}
          />
        );
      }
    } else if (this.props.playLesson.answeredQuestions.length > 0 && (this.props.playLesson.unansweredQuestions.length === 0 && this.props.playLesson.currentQuestion === undefined)) {
      component = (
        <Finished
          data={this.props.playLesson}
          error={this.state.error}
          lessonID={this.props.params.lessonID}
          name={this.state.sessionID}
          saved={this.state.saved}
          saveToLMS={this.saveToLMS}
        />
      );
    } else {
      component = (
        <Register lesson={this.getLesson()} resumeActivity={this.resumeSession} session={this.state.session} startActivity={this.startActivity} />
      );
    }

    return (
      <div>
        <progress className="progress diagnostic-progress" max="100" value={this.getProgressPercent()}>15%</progress>
        <section className="section is-fullheight minus-nav student">
          <div className="student-container student-container-diagnostic">
            {component}
          </div>
        </section>
      </div>
    );
  }
}

function select(state) {
  return {
    lessons: state.lessons,
    questions: state.questions,
    sentenceFragments: state.sentenceFragments,
    playLesson: state.playLesson, // the questionReducer
    routing: state.routing,
    fillInBlank: state.fillInBlank,
    titleCards: state.titleCards,
    conceptsFeedback: state.conceptsFeedback
  };
}

export default connect(select)(Lesson);
