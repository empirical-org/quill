import * as React from "react";
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';

import Navigation from './navigation'
import ActivitySettings from './configureSettings/activitySettings';
import Rules from './configureRules/rules';
import Rule from './configureRules/rule';
import RulesAnalysis from './rulesAnalysis/rulesAnalysis';
import RuleAnalysis from './rulesAnalysis/ruleAnalysis';
import TurkSessions from './gatherResponses/turkSessions';
import SessionsIndex from './activitySessions/sessionsIndex';
import SessionView from './activitySessions/sessionView';
import SemanticLabelsIndex from './semanticRules/semanticLabelsIndex';
import RegexRulesRouter from './regexRules/regexRulesRouter';

import { ActivityRouteProps } from '../../interfaces/comprehensionInterfaces';

const Activity: React.FC<RouteComponentProps<ActivityRouteProps>> = ({ match, location, }) => {
  return(
    <React.Fragment>
      <Navigation location={location} match={match} />
      <div className="activity-container">
        <Switch>
          <Redirect exact from='/activities/:activityId' to='/activities/:activityId/settings' />
          <Route component={ActivitySettings} path='/activities/:activityId/settings' />
          <Route component={Rule} path='/activities/:activityId/rules/:ruleId' />
          <Route component={Rules} path='/activities/:activityId/rules' />
          <Route component={RuleAnalysis} path='/activities/:activityId/rules-analysis/:ruleId' />
          <Route component={RulesAnalysis} path='/activities/:activityId/rules-analysis' />
          <Route component={TurkSessions} path='/activities/:activityId/turk-sessions' />
          <Route component={SessionView} path='/activities/:activityId/activity-sessions/:sessionId' />
          <Route component={SessionsIndex} path='/activities/:activityId/activity-sessions' />
          <Route component={SemanticLabelsIndex} path='/activities/:activityId/semantic-labels' />
          <Route component={RegexRulesRouter} path='/activities/:activityId/regex-rules' />
        </Switch>
      </div>
    </React.Fragment>
  );
}

export default withRouter(Activity)
