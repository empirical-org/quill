import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import ConceptSelector from '../shared/conceptSelector.jsx';
import { ConceptExplanation } from 'quill-component-library/dist/componentLibrary';
import questionActions from '../../actions/questions';

class ChooseModelContainer extends Component {
  constructor(props) {
    super(props);
    const modelConceptUID = props.questions.data[props.params.questionID].modelConceptUID
    const lessonUID = Object.keys(props.lessons.data).find((uid) => {
      const lesson = props.lessons.data[uid]
      if (!lesson.questions) return false;
      return lesson.questions.find(q => q.key === props.params.questionID)
    })
    const lessonModelConceptUID = lessonUID && props.lessons.data[lessonUID] ? props.lessons.data[lessonUID].modelConceptUID : null
    this.state = {
      modelConceptUID,
      lessonModelConceptUID
    }
  }

  getModelConceptUID = () => {
    return this.state.modelConceptUID || this.props.questions.data[this.props.params.questionID].modelConceptUID;
  }

  removeModelConcept = () => {
    let questionData = Object.assign({}, this.props.questions.data[this.props.params.questionID], {modelConceptUID: null});
    this.props.dispatch(questionActions.submitQuestionEdit(this.props.params.questionID, questionData));
  };

  saveModelConcept = () => {
    this.props.dispatch(questionActions.submitQuestionEdit(this.props.params.questionID,
      Object.assign({}, this.props.questions.data[this.props.params.questionID], {modelConceptUID: this.state.modelConceptUID})));
    window.history.back();
  };

  selectConcept = e => {
    this.setState({ modelConceptUID: e.value });
  };

  renderButtons = () => {
    return(
      <p className="control">
        <button
          className={'button is-primary'}
          disabled={this.state.modelConceptUID == this.props.questions.data[this.props.params.questionID].modelConceptUID ? 'true' : null}
          onClick={this.saveModelConcept}
        >
          Save Model Concept
        </button>
        <button
          className={'button is-outlined is-info'}
          onClick={() => window.history.back()}
          style={{marginLeft: 5}}
        >
          Cancel
        </button>
        <button
          className="button is-outlined is-danger"
          onClick={this.removeModelConcept}
          style={{marginLeft: 5}}
        >
          Remove
        </button>
      </p>
    )
  }

  renderLessonModelNote = () => {
    if (this.state.lessonModelConceptUID && this.state.lessonModelConceptUID !== this.state.modelConceptUID) {
      const concept = this.props.concepts.data['0'].find(c => c.uid === this.state.lessonModelConceptUID)
      if (concept) {
        return (<div style={{ marginBottom: '10px' }}>
          <p>The activity that this question belongs to has the following Model Concept:</p>
          <p><i>"{concept.displayName}"</i></p>
        </div>)
      }
    }
  }

  render() {
    return(
      <div className="box">
        <h4 className="title">Choose Model</h4>
        {this.renderLessonModelNote()}
        <div className="control">
          <ConceptSelector currentConceptUID={this.getModelConceptUID()} handleSelectorChange={this.selectConcept} onlyShowConceptsWithConceptFeedback />
          <ConceptExplanation {...this.props.conceptsFeedback.data[this.getModelConceptUID()]} />
          {this.props.children}
        </div>
        {this.renderButtons()}
      </div>
    )
  }
}

function select(props) {
  return {
    lessons: props.lessons,
    questions: props.questions,
    conceptsFeedback: props.conceptsFeedback,
    concepts: props.concepts
  };
}

export default connect(select)(ChooseModelContainer);
