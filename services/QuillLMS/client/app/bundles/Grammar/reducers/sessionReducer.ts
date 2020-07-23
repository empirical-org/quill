import { Action } from "redux";
import { ActionTypes } from "../actions/actionTypes";
import { Question } from '../interfaces/questions'

export interface SessionState {
  hasreceiveddata: boolean;
  answeredQuestions: Question[]|never;
  unansweredQuestions: Question[]|never;
  currentQuestion: Question|null;
  proofreaderSession?: any;
  error?: string;
  pending: boolean;
}

type SessionAction = Action & { data: any, attempts: any, response: any, session: any }

const initialState = {hasreceiveddata: false, answeredQuestions: [], unansweredQuestions: [], currentQuestion: null, pending: true}

export default (
    currentState: SessionState = initialState,
    action: SessionAction,
): SessionState => {
    let currentQuestion: Question|{}
    switch (action.type) {
        case ActionTypes.SET_SESSION:
            return Object.assign({}, currentState, action.session, { pending: false, hasreceiveddata: true })
        case ActionTypes.RECEIVE_QUESTION_DATA:
            return Object.assign({}, currentState, { unansweredQuestions: action.data, hasreceiveddata: true});
        case ActionTypes.NO_QUESTIONS_FOUND_FOR_SESSION:
            return Object.assign({}, currentState, { error: 'No questions found.'})
        case ActionTypes.GO_T0_NEXT_QUESTION:
            const changes: SessionState = Object.assign({}, currentState)
            if (currentState.currentQuestion) {
              changes.answeredQuestions = currentState.answeredQuestions.concat([currentState.currentQuestion])
            }
            changes.currentQuestion = changes.unansweredQuestions.splice(0, 1)[0]
            if (changes.currentQuestion) {
              changes.currentQuestion.attempts = []
            }
            return Object.assign({}, currentState, changes)
        case ActionTypes.SUBMIT_RESPONSE:
            currentQuestion = Object.assign({}, currentState.currentQuestion)
            currentQuestion.attempts = currentQuestion.attempts ? currentQuestion.attempts.concat([action.response]) : [action.response]
            return Object.assign({}, currentState, {currentQuestion})
        case ActionTypes.SET_PROOFREADER_SESSION_TO_REDUCER:
            return Object.assign({}, currentState, {proofreaderSession: action.data})
        case ActionTypes.SET_SESSION_PENDING:
            return Object.assign({}, currentState, {pending: action.pending})
        case ActionTypes.START_NEW_SESSION:
            return Object.assign({}, initialState, { pending: false, })
        default:
            return currentState;
    }
};