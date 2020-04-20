import React from 'react'
import C from '../../constants'
import { connect } from 'react-redux'
import actions from '../../actions/concepts-feedback'
import feedbackActions from '../../actions/concepts-feedback'
import _ from 'underscore'
import FeedbackForm from './feedbackForm.jsx'
import { ConceptExplanation } from 'quill-component-library/dist/componentLibrary';

class ConceptFeedback extends React.Component {
  cancelEdit = (feedbackID) => {
      this.props.dispatch(actions.cancelConceptsFeedbackEdit(feedbackID))
  };

  deleteConceptsFeedback = () => {
    this.props.dispatch(actions.deleteConceptsFeedback(this.props.params.feedbackID))
  };

  submitNewFeedback = (feedbackID, data) => {
    if(true) {
      this.props.dispatch(feedbackActions.submitConceptsFeedbackEdit(feedbackID, data)
      )
    }
  };

  toggleEdit = () => {
    this.props.dispatch(actions.startConceptsFeedbackEdit(this.props.params.feedbackID))
  };

  render() {
    const {data, states} = this.props.conceptsFeedback;
    const {feedbackID} = this.props.params;

    if (data && data[feedbackID]) {
      const isEditing = (states[feedbackID] === C.START_CONCEPTS_FEEDBACK_EDIT);
      if (isEditing) {
        return (
          <div key={this.props.params.feedbackID}>
            <h4 className="title">{data[feedbackID].name}</h4>
            <FeedbackForm {...data[feedbackID]} cancelEdit={this.cancelEdit} feedbackID={feedbackID} submitNewFeedback={this.submitNewFeedback} />
          </div>
        )
      } else {
        return (
          <div key={this.props.params.feedbackID}>
            <ConceptExplanation {...data[feedbackID]} />
            <p className="control">
              <button className="button is-info" onClick={this.toggleEdit}>Edit Feedback</button> <button className="button is-danger" onClick={this.deleteConceptsFeedback}>Delete Concept</button>
            </p>
          </div>
        )
      }

    } else if (this.props.concepts.hasreceiveddata === false){
      return (<p>Loading...</p>)
    } else {
      return (
        <div className="container" key={this.props.params.feedbackID}>
          <FeedbackForm cancelEdit={this.cancelEdit} feedbackID={this.props.params.feedbackID} submitNewFeedback={this.submitNewFeedback} />
        </div>
      )
    }

  }
}

function select(state) {
  return {
    concepts: state.concepts,
    conceptsFeedback: state.conceptsFeedback,
    questions: state.questions,
    routing: state.routing
  }
}

export default connect(select)(ConceptFeedback)
