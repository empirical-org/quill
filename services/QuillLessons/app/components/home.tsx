import * as React from 'react';
import { renderRoutes } from "react-router-config";
import { routes } from "../routes";
import { Layout } from "antd";

export default class Home extends React.Component<any, any> {
  constructor(props) {
    super(props)

    this.state = { showFocusState: false }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = (e: any) => {
    if (e.key !== 'Tab') { return }

    const { showFocusState, } = this.state

    if (showFocusState) { return }

    this.setState({ showFocusState: true })
  }

  handleSkipToMainContentClick = () => {
    const element = document.getElementById("main-content")
    element && element.focus()
    element && element.scrollIntoView()
  }

  render() {
    const { showFocusState, } = this.state
    const className = showFocusState ? '' : 'hide-focus-outline'
    return(
      <Layout className={className}>
        <Layout>
          <Layout.Content>
            <button className="skip-main" onClick={this.handleSkipToMainContentClick} type="button">Skip to main content</button>
            <div id="main-content" tabIndex={-1}>{renderRoutes(routes)}</div>
          </Layout.Content>
        </Layout>
      </Layout>
    );
  }
};