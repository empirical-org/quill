import { Action } from "redux";

export const ActionTypes = {
    // INIT STORE
    INIT_STORE: 'INIT_STORE',

    // PROOFREADER ACTIVITIES
    RECEIVE_PROOFREADER_ACTIVITY_DATA: 'RECEIVE_PROOFREADER_ACTIVITY_DATA',
    NO_PROOFREADER_ACTIVITY_FOUND: 'NO_PROOFREADER_ACTIVITY_FOUND',
    RECEIVE_PROOFREADER_ACTIVITIES_DATA: 'RECEIVE_PROOFREADER_ACTIVITIES_DATA',
    NO_PROOFREADER_ACTIVITIES_FOUND: 'NO_PROOFREADER_ACTIVITIES_FOUND',
    TOGGLE_NEW_LESSON_MODAL: 'TOGGLE_NEW_LESSON_MODAL',
    AWAIT_NEW_LESSON_RESPONSE: 'AWAIT_NEW_LESSON_RESPONSE',
    RECEIVE_NEW_LESSON_RESPONSE: 'RECEIVE_NEW_LESSON_RESPONSE',
    START_LESSON_EDIT: 'START_LESSON_EDIT',
    SUBMIT_LESSON_EDIT: 'SUBMIT_LESSON_EDIT',
    FINISH_LESSON_EDIT: 'FINISH_LESSON_EDIT',
    EDITING_LESSON: 'EDITING_LESSON',
    SUBMITTING_LESSON: 'SUBMITTING_LESSON',

    // QUESTIONS
    // RECEIVE_QUESTION_DATA: 'RECEIVE_QUESTION_DATA',
    // NO_QUESTIONS_FOUND: 'NO_QUESTIONS_FOUND',
    // GO_T0_NEXT_QUESTION: 'GO_T0_NEXT_QUESTION',
    SUBMIT_EDIT: 'SUBMIT_RESPONSE',

    // SESSIONS
    SET_FIREBASE_PASSAGE: 'SET_FIREBASE_PASSAGE',
    SET_PASSAGE: 'SET_PASSAGE',

    // CONCEPTS,
    RECEIVE_CONCEPTS_DATA: 'RECEIVE_CONCEPTS_DATA',

    // DISPLAY
    DISPLAY_ERROR: 'DISPLAY_ERROR',
    DISPLAY_MESSAGE: 'DISPLAY_MESSAGE',
    CLEAR_DISPLAY_MESSAGE_AND_ERROR: 'CLEAR_DISPLAY_MESSAGE_AND_ERROR',
};
//
