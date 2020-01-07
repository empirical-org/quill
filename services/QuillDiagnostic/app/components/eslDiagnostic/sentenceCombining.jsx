import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import { submitResponse, } from '../../actions/diagnostics.js';
import ReactTransition from 'react-addons-css-transition-group';
import { getGradedResponsesWithCallback } from '../../actions/responses.js';
import RenderQuestionFeedback from '../renderForQuestions/feedbackStatements.jsx';
import RenderQuestionCues from '../renderForQuestions/cues.jsx';
import {
  SentenceFragments,
  Error,
  Feedback
} from 'quill-component-library/dist/componentLibrary';
import RenderFeedback from '../renderForQuestions/feedback';
import getResponse from '../renderForQuestions/checkAnswer';
import submitQuestionResponse from '../renderForQuestions/submitResponse.js';
import updateResponseResource from '../renderForQuestions/updateResponseResource.js';
import TextEditor from '../renderForQuestions/renderTextEditor.jsx';
import translations from '../../libs/translations/index.js';
import translationMap from '../../libs/translations/ellQuestionMapper.js';

const C = require('../../constants').default;

class ELLSentenceCombining extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      editing: false,
      response: '',
      readyForNext: false,
    }
  }

  componentDidMount = () => {
    getGradedResponsesWithCallback(
      this.getQuestion().key,
      (data) => {
        this.setState({ responses: data, });
      }
    );
  }

  getInitialValue = () => {
    if (prefill) {
      return this.getQuestion().prefilledText;
    }
  }

  removePrefilledUnderscores = () => {
    this.setState(prevState => ({ value: prevState.response.replace(/_/g, '') }))
  }

  getQuestion = () => {
    const { question, } = this.props;
    if (question.key.endsWith('-esp')) {
      question.key = question.key.slice(0, -4);
    }
    return question;
  }

  getInstructionText = () => {
    const { language, } = this.props
    const q = this.getQuestion()
    const textKey = translationMap[q.key];
    let text = q.instructions ? q.instructions : translations.english[textKey];
    if (language && language !== 'english') {
      const textClass = language === 'arabic' ? 'right-to-left' : '';
      text += `<br/><br/><span class="${textClass}">${translations[language][textKey]}</span>`;
    }
    return (<p dangerouslySetInnerHTML={{ __html: text, }} />);
  }

  getResponses = () => {
    const { responses, } = this.state
    return responses;
  }

  getResponse2(rid) {
    return this.getResponses()[rid];
  }

  submitResponse = (response) => {
    const { sessionKey, } = this.state
    submitQuestionResponse(response, this.props, sessionKey, submitResponse);
  }

  renderSentenceFragments = () => {
    return <SentenceFragments prompt={this.getQuestion().prompt} />;
  }

  listCuesAsString(cues) {
    const newCues = cues.slice(0);
    return `${newCues.splice(0, newCues.length - 1).join(', ')} or ${newCues.pop()}.`;
  }

  renderFeedback = () => {
    const { question, } = this.props
    return (<RenderFeedback
      getQuestion={this.getQuestion}
      listCuesAsString={this.listCuesAsString}
      question={question}
      renderFeedbackStatements={this.renderFeedbackStatements}
      sentence="We have not seen this sentence before. Could you please try writing it in another way?"
    />);
  }

  getErrorsForAttempt(attempt) {
    return _.pick(attempt, ...C.ERROR_TYPES);
  }

  renderFeedbackStatements(attempt) {
    return <RenderQuestionFeedback attempt={attempt} getErrorsForAttempt={this.getErrorsForAttempt} getQuestion={this.getQuestion} />;
  }

  renderCues = () => {
    const { language, } = this.props
    return (<RenderQuestionCues
      displayArrowAndText
      getQuestion={this.getQuestion}
      language={language}
    />);
  }

  updateResponseResource = (response) => {
    const { dispatch, } = this.props

    updateResponseResource(response, this.getQuestion().key, this.getQuestion().attempts, dispatch);
  }

  handleSubmitResponse = (e) => {
    const { editing, responses, response, } = this.state
    const { marking, } = this.props

    if (editing && responses) {
      this.removePrefilledUnderscores();
      const response = getResponse(this.getQuestion(), response, this.getResponses(), marking || 'diagnostic');
      this.updateResponseResource(response);
      if (response.response && response.response.author === 'Missing Details Hint') {
        this.setState({
          editing: false,
          error: 'Your answer is too short. Please read the directions carefully and try again.',
        });
      } else {
        this.submitResponse(response);
        this.setState({
          editing: false,
          response: '',
          error: undefined,
        }, this.handleNextQuestionClick()
        );
      }
    }
  }

  toggleDisabled = () => {
    const { editing, } = this.state

    return editing ? '' : 'is-disabled'
  }

  handleChange = (e) => {
    this.setState({ editing: true, response: e, });
  }

  readyForNext = () => {
    const { question, } = this.props
    if (question.attempts.length > 0) {
      const latestAttempt = getLatestAttempt(question.attempts);
      if (latestAttempt.found) {
        const errors = _.keys(this.getErrorsForAttempt(latestAttempt));
        if (latestAttempt.response.optimal && errors.length === 0) {
          return true;
        }
      }
    }
    return false;
  }

  getProgressPercent = () => {
    const { question, } = this.props
    return question.attempts.length / 3 * 100;
  }

  finish = () => {
    this.setState({ finished: true, });
  }

  handleNextQuestionClick = () => {
    const { nextQuestion, } = this.props
    this.setState({ response: '', });
    nextQuestion();
    this.setState({ response: '', });
  }

  renderNextQuestionButton(correct) {
    if (correct) {
      return (<button className="button is-outlined is-success" onClick={this.handleNextQuestionClick} type="button">Siguiente</button>);
    }
    return (<button className="button is-outlined is-warning" onClick={this.handleNextQuestionClick} type="button">Siguiente</button>);
  }

  renderMedia = () => {
    if (this.getQuestion().mediaURL) {
      return (
        <div style={{ marginTop: 15, minWidth: 200, }}>
          <img alt={this.getQuestion().mediaAlt} src={this.getQuestion().mediaURL} />
        </div>
      );
    }
  }

  getSubmitButtonText = () => {
    const { language, } = this.props
    let text = translations.english['submit button text'];
    if (language !== 'english') {
      text += ` / ${translations[language]['submit button text']}`;
    }
    return text;
  }

  render = () => {
    const { language, questions, } = this.props
    const { responses, error, response, } = this.state
    let button;
    const fullPageInstructions = language === 'arabic' ? { maxWidth: 800, width: '100%', } : { display: 'block', };
    if (responses && Object.keys(responses).length) {
      if (question.attempts.length > 0) {
        button = <button className="button student-submit" onClick={this.handleNextQuestionClick} type="button">{this.getSubmitButtonText()}</button>;
      } else {
        button = <button className="button student-submit" onClick={this.handleSubmitResponse} type="button">{this.getSubmitButtonText()}</button>;
      }
    } else {
      button = <button className="button student-submit is-disabled" type="button">{this.getSubmitButtonText()}</button>;
    }
    if (question) {
      const instructions = (question.instructions && question.instructions !== '') ? question.instructions : 'Combine the sentences into one sentence. Combinar las frases en una frase.';
      return (
        <div className="student-container-inner-diagnostic">
          <div style={{ display: 'flex', justifyContent: 'spaceBetween', }}>
            <div style={fullPageInstructions}>
              {this.renderSentenceFragments()}
              {this.renderCues()}
              <Feedback
                feedback={this.getInstructionText()}
                feedbackType="instructions"
              />
            </div>
            {this.renderMedia()}
          </div>

          <ReactTransition transitionAppear transitionAppearTimeout={500} transitionEnterTimeout={500} transitionLeaveTimeout={500} transitionName='text-editor'>
            <TextEditor
              className='textarea is-question is-disabled'
              defaultValue={this.getInitialValue()}
              disabled={this.readyForNext()}
              getResponse={this.getResponse2}
              hasError={error}
              onChange={this.handleChange}
              onSubmitResponse={this.handleSubmitResponse}
              placeholder="Type your answer here."
              value={response}
            />
            <div className="button-and-error-row">
              <Error error={error} />
              <div className="question-button-group button-group">
                {button}
              </div>
            </div>
          </ReactTransition>
        </div>
      );
    }
    return (<p>Loading / Cargando...</p>);
  }
}

const getLatestAttempt = (attempts = []) => {
  const lastIndex = attempts.length - 1;
  return attempts[lastIndex];
};

function select(state) {
  return {
    concepts: state.concepts,
    questions: state.questions,
    routing: state.routing,
  };
}

export default connect(select)(PlayDiagnosticQuestion);
