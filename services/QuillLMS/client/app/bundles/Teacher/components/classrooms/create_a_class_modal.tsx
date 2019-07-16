import * as React from 'react'

import CreateAClassForm from './create_a_class_form'
import AddStudents from './add_students'

const closeIconSrc = `${process.env.CDN_URL}/images/icons/close.svg`

interface CreateAClassModalProps {
  close: (event) => void;
}

interface CreateAClassModalState {
  step: number;
  classroom: any;
}

export default class CreateAClassModal extends React.Component<CreateAClassModalProps, CreateAClassModalState> {
  constructor(props) {
    super(props)

    this.state = {
      step: 1,
      classroom: {}
    }

    this.next = this.next.bind(this)
    this.setClassroom = this.setClassroom.bind(this)
  }

  next() {
    this.setState({ step: this.state.step + 1 })
  }

  setClassroom(classroom) {
    this.setState({ classroom })
  }

  renderHeader() {
    const { step, } = this.state
    return <div className="create-a-class-modal-header">
      <div className="navigation">
        <p className={step === 1 ? 'active' : ''}>1. Create a class</p>
        <p className={step === 2 ? 'active' : ''}>2. Add students</p>
        <p className={step === 3 ? 'active' : ''}>3. Setup instructions</p>
      </div>
      <img src={closeIconSrc} onClick={this.props.close} />
    </div>
  }

  renderModalContent() {
    const { step, classroom, } = this.state
    if (step === 1) {
      return <CreateAClassForm next={this.next} setClassroom={this.setClassroom} />
    } else if (step === 2) {
      return <AddStudents next={this.next} classroom={classroom} />
    }
  }

  render() {
    return <div className="modal-container create-a-class-modal-container">
      <div className="modal-background" />
      <div className="create-a-class-modal modal">
        {this.renderHeader()}
        {this.renderModalContent()}
      </div>
    </div>
  }
}
