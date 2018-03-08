import React from 'react'
import createReactClass from 'create-react-class'
import PropTypes from 'prop-types'

export default createReactClass({
  propTypes: {
    subscription: PropTypes.object,
  },

  renderExpirationDate() {
    if (this.props.subscription.expiration) {
      return `Expires: ${this.transformDate(this.props.subscription.expiration)}`
    } else {
      return 'No expiration date set.'
    }
  },

  transformDate(dateString) {
    if (dateString) {
      let year,
      month,
      day,
      newString;
      year = dateString.slice(0, 4);
      month = dateString.slice(5, 7);
      day = dateString.slice(8, 10);
      newString = `${month}/${day}/${year}`;
      return newString;
    } else {
      return ''
    }
  },

  subscriptionType() {
    return this.props.subscription.subscriptionType;
  },

  subscriptionTypeInUserLanguage() {
    if (['none', 'locked'].includes(this.subscriptionType())) {
      return ('basic');
    }
    return (this.props.subscription.subscriptionType);
  },

  render() {
    let getPremium,
      subscriptionDetails;
    if (['free', 'locked', 'none'].includes(this.subscriptionType())) {
      getPremium = (
          <a href="/premium" target="_new">
            <button className="form-button get-premium">Get Premium</button>
          </a>);
      subscriptionDetails = null;
    } else {
      getPremium = null;
      subscriptionDetails = (
        <span className="gray-text">
          <div className="row">
              {this.renderExpirationDate()}
          </div>
        </span>
        );
    }
    return (
      <span>
        <div className="form-row">
          <div className="form-label">
            Status
          </div>
          <div className="form-input">
            <input disabled className="inactive" value={this.subscriptionTypeInUserLanguage()} />
          </div>
          {getPremium}

        </div>
        {subscriptionDetails}
      </span>
    );
  },
});
