import React from 'react';
import _ from 'underscore';

import LoadingIndicator from '../../../shared/loading_indicator';
import ScrollToTop from '../../../shared/scroll_to_top';
import UnitTemplateProfileDescription from './unit_template_profile_description';
import UnitTemplateProfileAssignButton from './unit_template_profile_assign_button';
import UnitTemplateProfileShareButtons from './unit_template_profile_share_buttons';
import UnitTemplateProfileStandards from './unit_template_profile_standards';
import UnitTemplateProfileActivityTable from './unit_template_profile_activity_table';

import { requestGet } from '../../../../../../modules/request/index.js';

export default class UnitTemplateProfile extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      data: null,
      loading: true
    }
  }

  componentDidMount() {
    this.getProfileInfo(this.props.params.activityPackId);
  }

  getProfileInfo(id) {
    requestGet(`/teachers/unit_templates/profile_info?id=${id}`, (response) => {
      this.displayUnit(response)
    })
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.location, nextProps.location)) {
      this.setState({ loading: true, });
      this.getProfileInfo(nextProps.params.activityPackId);
    }
  }

  displayUnit(response) {
    this.setState({
      data: response.data,
      referralCode: response.referral_code,
      loading: false
    })
  }

  indexLink() {
    return this.state.data.non_authenticated
      ? '/activities/packs'
      : '/teachers/classrooms/assign_activities/featured-activity-packs';
  }

  socialShareUrl() {
    return `${window.location}${this.state.referralCode ? '?referral_code=' + this.state.referralCode : ''}`
  }

  socialText() {
    return `Check out the '${this.state.data.name}' activity pack I just assigned on Quill.org! ${this.socialShareUrl()}`
  }

  getMetaText(data) {
    return `Check out the '${data.name}' activity pack I just assigned on Quill.org!`;
  }

  render() {
    const { data, loading, } = this.state
    if (loading) {
      return <LoadingIndicator />
    }
    if (document.querySelector("meta[name='og:description']")) {
      document.querySelector("meta[name='og:description']").content = this.getMetaText(data);
    }
    return (
      <div className="unit-template-profile">
        <ScrollToTop  />
        <div className="unit-template-profile-container">
          <h1>Activity Pack: {data.name}</h1>
          <UnitTemplateProfileActivityTable data={data}  />
          <div className="first-content-section flex-row space-between first-content-section">
            <div className="description">
              <UnitTemplateProfileDescription data={data}  />
            </div>
            <div className="assign-buttons-and-standards">
              <UnitTemplateProfileAssignButton data={data}  />
              <UnitTemplateProfileStandards data={data}  />
              <UnitTemplateProfileShareButtons data={data} url={this.socialShareUrl()} text={this.socialText()}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
