import React from 'react';
import { Spinner } from '../../../Shared/index';
export default class extends React.Component {
  componentDidMount() {
    const { saveToLMS } = this.props;
    saveToLMS();
  }

  renderSavedIndicator = () => {
    const { saved } = this.props;
    if (saved) {
      return (
        <div>
          Saved Diagnostic
        </div>
      );
    } else {
      return (
        <div>
          Saving Diagnostic
        </div>
      );
    }
  };

  renderErrorState = () => {
    const { error, saveToLMS } = this.props;
    let header
    let message
    if (error === "Activity Session Already Completed") {
      header = "This Activity Session Has Already Been Completed"
      message = (<p>
        The activity session with this unique identifier has already been&nbsp;completed.<br />
        In order to redo this activity, you must return to your dashboard and click "Replay Activity".<br />
        If you believe that you have received this message in error, ask your teacher to contact Quill.<br />
        Please provide the following URL to help us solve the problem.
      </p>)
    } else {
      header = "We Couldn't Save Your Activity Session."
      message = (<p>Your results could not be saved. <br />
        Make sure you are connected to the internet.<br />
        You can attempt to save again using the button below.<br />
        If the issue persists, ask your teacher to contact Quill.<br />
        Please provide the following URL to help us solve the problem.
      </p>)
    }
    return (
      <div className="landing-page">
        <h1>{header}</h1>
        {message}
        <p><code style={{ fontSize: 14, }}>
          {window.location.href}
        </code></p>
        <button className="button is-info is-large" onClick={saveToLMS}>Retry</button>
      </div>
    );
  };

  render() {
    const { error } = this.props;
    if (error) {
      return this.renderErrorState()
    } else {
      return (
        <div className="landing-page">
          <h1>You've completed the Quill Placement Activity </h1>
          <p>
            Your results are being saved now.
            You'll be redirected automatically once they are saved.
          </p>
          <Spinner />
        </div>
      );
    }
  }
}
