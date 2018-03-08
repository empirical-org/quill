import React from 'react'
import createReactClass from 'create-react-class'

export default (props) => (
  <div className="lesson-type-mini" onClick={() => window.location = props.link}>
    <img src={props.imgSrc}/>
    <div className="text">
      <h1>{props.name}</h1>
      <p>{props.description}</p>
    </div>
  </div>
)
