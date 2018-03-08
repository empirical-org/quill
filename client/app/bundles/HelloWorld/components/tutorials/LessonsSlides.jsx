import React from 'react'
import createReactClass from 'create-react-class'

const SlideOne = () => {
  return <div key='one' className='slide lessons-slide-one'>
      <div className="media">
        <img className="illustration" src={`${process.env.CDN_URL}/images/tutorials/lessons/slide_1.svg`} />
        <img className="caption" src={`${process.env.CDN_URL}/images/tutorials/lessons/slide_1_text.svg`} />
      </div>
      <div className="text">
        <h1>Class-Wide Interactive Activities</h1>
        <p>Quill Lessons provides a series of interactive slides that allows the entire class to work on the activities with their teacher. Your students will answer the questions on their devices and you will be able to project the answers back to the class and lead a class discussion.</p>
      </div>
  </div>
}

const SlideTwo =() => {
  return <div key='two' className='slide lessons-slide-two'>
    <div className="media">
      <img className="illustration" src={`${process.env.CDN_URL}/images/tutorials/lessons/slide_2.svg`} />
      <img className="caption" src={`${process.env.CDN_URL}/images/tutorials/lessons/slide_2_text.svg`} />
    </div>
    <div className="text">
      <h1>Lead The Lesson</h1>
      <p>Each slide contains a step-by-step guide to help you introduce grammar concepts. The step-by-step guide also includes suggestions on how to discuss students’ answers and how to model strong writing skills to the students.</p>
    </div>
  </div>
}

const SlideThree =() => {
  return <div key='three' className='slide lessons-slide-three'>
    <div className="media">
      <img className="illustration" src={`${process.env.CDN_URL}/images/tutorials/lessons/slide_3.svg`} />
      <img className="caption" src={`${process.env.CDN_URL}/images/tutorials/lessons/slide_3_text.svg`} />
    </div>
    <div className="text">
      <h1>Discuss Student Answers</h1>
      <p>See your student answers in real-time, and facilitate a conversation by selecting both strong and weak answers to project to the class. As a class, students can discuss why certain sentences are stronger than others.</p>
    </div>
  </div>
}

const SlideFour =() => {
  return <div key='four' className='slide lessons-slide-four'>
    <div className="media">
      <img className="illustration" src={`${process.env.CDN_URL}/images/tutorials/lessons/slide_4.svg`} />
      <img className="caption" src={`${process.env.CDN_URL}/images/tutorials/lessons/slide_4_text.svg`} />
    </div>
    <div className="text">
      <h1>Identify Students For Small Group</h1>
      <p>When the students respond, you can click on the “flag” button to select students who may need extra support. At the end of the lesson, you can pull aside the flagged students for small group instruction.</p>
    </div>
  </div>
}

// there is no video for this slide right now so it is not being passed to the tutorial index
const SlideFive =() => {
  return <div key='five' className='slide lessons-slide-five'>
    <div className="media">
      <video />
    </div>
  </div>
}

const SlideSix =() => {
  return <div key='six' className='slide lessons-slide-six'>
    <div className="media">
      <img className="illustration" src={`${process.env.CDN_URL}/images/tutorials/lessons/slide_6.svg`} />
      <img className="caption" src={`${process.env.CDN_URL}/images/tutorials/lessons/slide_6_text.svg`} />
    </div>
    <div className="text">
      <h1>Navigation Bar Links</h1>
      <p>The icons at the top of the page allow you to see flagged students, open a new window to project lesson, freeze students’ screen, exit the lesson, and view this guide.</p>
    </div>
  </div>
}

export default [SlideOne(), SlideTwo(), SlideThree(), SlideFour(), SlideSix()]
