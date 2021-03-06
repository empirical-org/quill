import React from 'react'

export default class UnitTemplateSecondRow extends React.Component {
  authorName = () => {
    var name;
    if (this.props.data.author) {
      name = this.props.data.author.name;
    } else {
      name = null;
    }
    return name;
  };

  sayAttribution = () => {
    return ['by', this.authorName()].join(' ');
  };

  numberOfActivities = () => {
    return this.props.data.activities ? this.props.data.activities.length : 0;
  };

  sayActivitiesCount = () => {
    return this.props.modules.string.sayNumberOfThings(this.numberOfActivities(), 'Activity', 'Activities')
  };

  sayTime = () => {
    return [this.props.data.time, 'mins'].join(' ');
  };

  render() {
    return (
      <div className='white-row'>
        <div className='row info-row'>
          <div style={{flex: 3}}>
            <div className='author'>
              {this.sayAttribution()}
            </div>
          </div>
          <div style={{flex: 5}}>
            <div className='activities-count'>
              <i className='fas fa-th-list' />
              {this.sayActivitiesCount()}
            </div>
            <div className='time'>
              <i className='far fa-clock' />
              <div className='time-number'>
                {this.sayTime()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
