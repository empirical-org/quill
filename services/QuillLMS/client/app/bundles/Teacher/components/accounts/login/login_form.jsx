import React from 'react';
import request from 'request';

import PasswordInfo from './password_info.jsx';

import PasswordWrapper from '../shared/password_wrapper'
import AssignActivityPackBanner from '../assignActivityPackBanner'
import getAuthToken from '../../modules/get_auth_token';
import { Input, } from '../../../../Shared/index'

class LoginFormApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      errors: {},
      timesSubmitted: 0,
    };
  }

  onEmailChange = (e) => {
    this.setState({ email: e.target.value, });
  }

  onPasswordChange = (e) => {
    this.setState({ password: e.target.value, });
  }

  async fetchUser() {
    return fetch('/api/v1/users.json', {
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

  handleCleverClick = (e) => {
    const { cleverLink, } = this.props
    window.location.href = cleverLink
  }

  handleGoogleClick = (e) => {
    this.fetchUser().then(userData => {
        var now = new Date().toISOString();
        if (userData.user === null || (userData.hasOwnProperty('role') && !userData.user.has_refresh_token) ||
            now > userData.user.refresh_token_expires_at) {
          window.location.href = '/auth/google_oauth2?prompt=consent';
        }
        else {
            window.location.href = '/auth/google_oauth2';
        }
      }
    );
  }

  handleKeyEnterOnSignUpLink = (e) => {
    if (e.key !== 'Enter') { return }

    this.handleSignUpClick(e)
  }

  handleSignUpClick = (e) => {
    window.location.href = '/account/new'
  }

  handleSubmit = (e) => {
    const { timesSubmitted, email, password, } = this.state;
    e.preventDefault();
    request({
      url: `${process.env.DEFAULT_URL}/session/login_through_ajax`,
      method: 'POST',
      json: {
        user: {
          email,
          password,
        },
        authenticity_token: getAuthToken(),
      },
    },
    (err, httpResponse, body) => {
      if (httpResponse.statusCode === 200 && body.redirect) {
        // console.log(body);
        window.location = body.redirect;
      } else {
        let state;
        if (body.type && body.message) {
          const errors = {};
          errors[body.type] = body.message;
          state = { lastUpdate: new Date(), errors, timesSubmitted: timesSubmitted + 1, };
        } else {
          let message = 'You have entered an incorrect email/username or password.';
          if (httpResponse.statusCode === 429) {
            message = 'Too many failed attempts. Please wait one minute and try again.';
          }
          state = { lastUpdate: new Date(), message: (body.message || message), };
        }
        this.setState(state);
      }
    });
  }

  submitClass = () => {
    const { password, email, } = this.state
    let buttonClass = 'quill-button contained primary medium focus-on-light';
    if (!password.length || !email.length) {
      buttonClass += ' disabled';
    }
    return buttonClass;
  }

  render() {
    const { errors, email, password, timesSubmitted, authToken, } = this.state;
    return (
      <div>
        <AssignActivityPackBanner login={true} />
        <div className="container account-form">
          <h1>Good to see you again!</h1>
          <div className="account-container text-center">
            <div className="auth-section">
              <button onClick={this.handleGoogleClick} type="button">
                <img alt="Google icon" src={`${process.env.CDN_URL}/images/shared/google_icon.svg`} />
                <span>Log in with Google</span>
              </button>
              <button onClick={this.handleCleverClick} type="button">
                <img alt="Clever icon" src={`${process.env.CDN_URL}/images/shared/clever_icon.svg`} />
                <span>Log in with Clever</span>
              </button>
            </div>
            <div className="break"><span  />or<span  /></div>
            <div className="login-form">
              <div>
                <form acceptCharset="UTF-8" onSubmit={this.handleSubmit} >
                  <input aria-hidden="true" aria-label="utf8" name="utf8" type="hidden" value="✓" />
                  <input aria-hidden="true" aria-label="authenticity token" name="authenticity_token" type="hidden" value={authToken} />
                  <Input
                    className="email"
                    error={errors.email}
                    handleChange={this.onEmailChange}
                    label="Email or username"
                    timesSubmitted={timesSubmitted}
                    type="text"
                    value={email}
                  />
                  <PasswordWrapper
                    autoComplete="current-password"
                    className="password inspectletIgnore"
                    error={errors.password}
                    id="password"
                    label="Password"
                    onChange={this.onPasswordChange}
                    timesSubmitted={timesSubmitted}
                    value={password}
                  />
                  <div className="forget-and-show-password">
                    <a className="inline-link" href="/password_reset">Forgot password?</a>
                  </div>
                  <input aria-label="Log in" className={this.submitClass()} name="commit" type="submit" value="Log in" />
                </form>
              </div>
            </div>
          </div>
          <p className="sign-up-link">Don&#39;t have an account?&nbsp;<span className="inline-link" onClick={this.handleSignUpClick} onKeyDown={this.handleKeyEnterOnSignUpLink} role="link" tabIndex={0}>Sign up</span></p>
          <PasswordInfo showHintBox={Object.keys(errors).length} />
        </div>
      </div>
    );
  }
}

export default LoginFormApp;
