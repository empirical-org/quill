import React from 'react'
import {connect} from 'react-redux'
import { Link } from 'react-router'
import TeacherLessonsNavbar from './teacherNavbar'
import CustomizeNavbar from './customizeNavbar'
import LaunchEditionNavbar from './launchEditionNavbar'
import CreateCustomizedEditionNavbar from './createCustomizedEditionNavbar'
import {getParameterByName} from '../../libs/getParameterByName'

class Navbar extends React.Component {
  state = {
    expanded: false
  };

  navStyles = () => {
    if (this.state.expanded) {
      return {
        background: '#fff',
        display: 'initial'
      }
    }
  };

  toggle = () => {
    this.setState({expanded: !this.state.expanded})
  };

  reset = () => {
    this.setState({expanded: false})
  };

  inLesson = () => {
    return (window.location.href.indexOf('play/lesson') !== -1);
  };

  quillLessons = () => {
    return window.location.href.includes('teach/class-lessons');
  };

  customizeRoute = () => {
    return (window.location.href.indexOf('customize') !== -1);
  };

  customizeNavbar = () => {
    if (this.props.match.params.editionID) {
      return <CustomizeNavbar goToSuccessPage={this.props.goToSuccessPage} params={this.props.match.params} />
    } else if (getParameterByName('classroom_unit_id') || getParameterByName('preview')) {
      return <LaunchEditionNavbar params={this.props.match.params} />
    } else {
      return <CreateCustomizedEditionNavbar />
    }
  };

  renderLinks = () => {
    if (this.inLesson()) {
      return (
        <div className="nav-right nav-menu" style={this.navStyles()} />
      )
    } else {
      return (
        <div className="nav-right nav-menu" style={this.navStyles()}>
          <a className="nav-item" href="http://www.connect.quill.org/dwqa-questions/">FAQ</a>
          <Link activeClassName="is-active" className="nav-item" onClick={this.reset} to={'/play'}>Demo</Link>
          <Link activeClassName="is-active" className="nav-item" onClick={this.reset} to={'/results'}>Results</Link>
          <Link activeClassName="is-active" className="nav-item" onClick={this.reset} to={'/lessons'}>Activities</Link>
        </div>
      )
    }
  };

  render() {
    if (this.quillLessons()) {
      return (<TeacherLessonsNavbar params={this.props.match.params} />);
    } else if (this.customizeRoute()) {
      return this.customizeNavbar()
    } else {
      return (
        <header className="nav" style={{height: '65px'}}>
          <div className="container">
            <div className="nav-left">
              <a className="nav-item" href="http://www.connect.quill.org">
                <img
                  alt=""
                  src="http://45.55.217.62/wp-content/uploads/2016/04/quill_connect_logo2.png"
                  style={{height: "35px"}}
                />
              </a>
            </div>
            {this.renderLinks()}
            <span className="nav-toggle" onClick={this.toggle}>
              <span />
              <span />
              <span />
            </span>
          </div>
        </header>
    )
    }
  }
}

const rightNav = (<div className="nav-right nav-menu">
  <span className="nav-item">
    <Link activeClassName="is-active" className="nav-item" to={'/admin'}>Admin</Link>
  </span>
  <span className="nav-item">
    <a href="#">
      Help
    </a>
  </span>
  <span className="nav-item">
    <a className="button" href="#">Button</a>
  </span>
</div>)

function select(state) {
  return {
    routing: state.routing
  }
}

export default connect(select)(Navbar)
