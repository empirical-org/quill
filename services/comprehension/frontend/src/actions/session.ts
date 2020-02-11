import * as request from 'request';

import { ActionTypes } from './actionTypes'

import { FeedbackObject } from '../interfaces/feedback'

export const getFeedback = (activityUID: string, entry: string, promptID: string, promptText: string, attempt: number, previousFeedback: FeedbackObject[], callback: Function = () => {}) => {
  return (dispatch: Function) => {
    const feedbackURL = 'https://us-central1-comprehension-247816.cloudfunctions.net/comprehension-endpoint-go'
    const promptRegex = new RegExp(`^${promptText}`)
    const entryWithoutStem = entry.replace(promptRegex, "").trim()

    const requestObject = {
      url: feedbackURL,
      body: {
        prompt_id: promptID,
        entry: entryWithoutStem,
        previous_responses: previousFeedback,
        attempt
      },
      json: true,
    }

    request.post(requestObject, (e, r, body) => {
      const { feedback, feedback_type, optimal, response_id, highlight, } = body
      const feedbackObj: FeedbackObject = {
        entry,
        feedback,
        feedback_type,
        optimal,
        response_id,
        highlight
      }
      dispatch({ type: ActionTypes.RECORD_FEEDBACK, promptID, feedbackObj });
      callback()
    })
  }
}
