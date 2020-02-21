import * as React from 'react';
import { Route, Switch, withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from 'react-redux';
import * as proofreaderActivitiesActions from '../../actions/proofreaderActivities'
import * as conceptsActions from '../../actions/concepts'
import Lessons from '../lessons/lessons'
import Lesson from '../lessons/lesson'
import Concepts from '../concepts/concepts'
// import Concept from '../concepts/concept'
import TabLink from './tabLink'
import request from 'request';

const usersEndpoint = `${process.env.EMPIRICAL_BASE_URL}/api/v1/users.json`;
const newSessionEndpoint = `${process.env.EMPIRICAL_BASE_URL}/session/new`;

interface PathParamsType {
  [key: string]: string,
}

type AdminContainerProps = RouteComponentProps<PathParamsType> & { dispatch: Function }

class AdminContainer extends React.Component<AdminContainerProps> {
  constructor(props: AdminContainerProps) {
    super(props)
  }

  componentWillMount() {
    this.fetchUser().then(userData => this.setState({ userData }));
    this.props.dispatch(proofreaderActivitiesActions.startListeningToActivities());
    this.props.dispatch(conceptsActions.startListeningToConcepts());
    this.state = { userData: '' }
  }

  async fetchUser() {
    return fetch(usersEndpoint, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    }).then((response) => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
    });
  }

  render() {
    if (this.state.userData.user === null || (this.state.userData.hasOwnProperty('role') && this.state.userData.user.role !== 'staff')){
      window.location = newSessionEndpoint;
    }
    else {
      return (
        <div style={{ display: 'flex', backgroundColor: "white", height: '100vw' }}>
          <section className="section is-fullheight" style={{ display: 'flex', flexDirection: 'row', paddingTop: 0, paddingBottom: 0, }}>
            <aside className="menu" style={{ minWidth: 220, borderRight: '1px solid #e3e3e3', padding: 15, paddingLeft: 0, }}>
              <p className="menu-label">
                General
              </p>
              <ul className="menu-list">
                <TabLink activeClassName="is-active" to={'/admin/lessons'}>Proofreader Activities</TabLink>
              </ul>
              <p className="menu-label">
                Supporting
              </p>
              <ul className="menu-list">
                <TabLink activeClassName="is-active" to={'/admin/concepts'}>Concepts</TabLink>
              </ul>
            </aside>
            <div className="admin-container">
              {this.props.children}
            </div>
          </section>
          <Switch>
            <Route component={Lesson} path={`/admin/lessons/:lessonID`} />
            <Route component={Lessons} path={`/admin/lessons`} />
            <Route component={Concepts} path={`/admin/concepts`} />
          </Switch>
        </div>
      );
    }
  }
}

function select(state) {
  return {
  };
}

function mergeProps(stateProps: Object, dispatchProps: Object, ownProps: Object) {
  return {...ownProps, ...stateProps, ...dispatchProps}
}

export default withRouter(connect(select, dispatch => ({dispatch}), mergeProps)(AdminContainer));
