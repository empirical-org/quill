import rootRef from '../firebase';
import { ActionTypes } from './actionTypes'
import { QuestionApi, GRAMMAR_QUESTION_TYPE } from '../libs/questions_api'
const sessionsRef = rootRef.child('sessions')
const proofreaderSessionsRef = rootRef.child('proofreaderSessions')
import * as responseActions from './responses'
import { Question } from '../interfaces/questions'
import { SessionState } from '../reducers/sessionReducer'
import { checkGrammarQuestion, Response } from 'quill-marking-logic'
import { hashToCollection } from '../helpers/hashToCollection'
import { shuffle } from '../helpers/shuffle';
import { permittedFlag } from '../helpers/flagArray'
import _ from 'lodash';

export const updateSessionOnFirebase = (sessionID: string, session: SessionState) => {
  const cleanedSession = _.pickBy(session)
  // cleanedSession.currentQuestion ? cleanedSession.currentQuestion.attempts = _.compact(cleanedSession.currentQuestion.attempts) : null
  if (!cleanedSession.error) {
    sessionsRef.child(sessionID).set(cleanedSession)
  }
}

export const setSessionReducerToSavedSession = (sessionID: string) => {
  return dispatch => {
    sessionsRef.child(sessionID).once('value', (snapshot) => {
      const session = snapshot.val()
      if (session && Object.keys(session).length > 1 && !session.error) {
        QuestionApi.getAll(GRAMMAR_QUESTION_TYPE).then((allQuestions) => {
          if (session.currentQuestion) {
            if (!session.currentQuestion.prompt || !session.currentQuestion.answers) {
              const currentQuestion = allQuestions[session.currentQuestion.uid]
              currentQuestion.uid = session.currentQuestion.uid
              session.currentQuestion = currentQuestion
            }
          }
          if (session.unansweredQuestions) {
            session.unansweredQuestions = session.unansweredQuestions.map((q) => {
              if (q.prompt && q.answers && q.uid) {
                return q
              } else {
                const question = allQuestions[q.uid]
                question.uid = q.uid
                return question
              }
            })
          }
          dispatch(setSessionReducer(session))
        })
      } else {
        dispatch(setSessionPending(false))
      }
    })
  }
}

export const startListeningToFollowUpQuestionsForProofreaderSession = (proofreaderSessionID: string) => {
  return (dispatch, getState) => {
    // we're turning this into a listener rather than a .once call in case the write action from proofreader is slower than the time it takes to get here
    proofreaderSessionsRef.child(proofreaderSessionID).on('value', (snapshot) => {
      const proofreaderSession = snapshot.val()
      // but we don't want to overwrite anything if there's already a proofreader session saved to the state here
      if (proofreaderSession && proofreaderSession.conceptResults && !getState().session.proofreaderSession) {
        const concepts: { [key: string]: { quantity: 1|2|3 } } = {}
        const incorrectConcepts = proofreaderSession.conceptResults.filter(cr => cr.metadata.correct === 0)
        let quantity = 3
        if (incorrectConcepts.length > 9) {
          quantity = 1
        } else if (incorrectConcepts.length > 4) {
          quantity = 2
        }
        proofreaderSession.conceptResults.forEach(cr => {
          if (cr.metadata.correct === 0) {
            concepts[cr.concept_uid] = { quantity }
          }
        })
        dispatch(saveProofreaderSessionToReducer(proofreaderSession))
        dispatch(getQuestionsForConcepts(concepts, 'production'))
        proofreaderSessionsRef.child(proofreaderSessionID).off()
      }
    })
  }
}

// typescript this
export const getQuestionsForConcepts = (concepts: any, flag: string) => {
  return (dispatch, getState) => {
    dispatch(setSessionPending(true))
    const conceptUIDs = Object.keys(concepts)
    QuestionApi.getAll(GRAMMAR_QUESTION_TYPE).then((questions) => {
      const questionsForConcepts = {}
      Object.keys(questions).map(q => {
        if (conceptUIDs.includes(questions[q].concept_uid) && questions[q].prompt && questions[q].answers && permittedFlag(flag, questions[q].flag)) {
          const question = questions[q]
          question.uid = q
          if (questionsForConcepts.hasOwnProperty(question.concept_uid)) {
            questionsForConcepts[question.concept_uid] = questionsForConcepts[question.concept_uid].concat(question)
          } else {
            questionsForConcepts[question.concept_uid] = [question]
          }
        }
      })

      const arrayOfQuestions = []
      Object.keys(questionsForConcepts).forEach(conceptUID => {
        const shuffledQuestionArray = shuffle(questionsForConcepts[conceptUID])
        const numberOfQuestions = shuffledQuestionArray.length >= concepts[conceptUID].quantity ? concepts[conceptUID].quantity : shuffledQuestionArray.length
        arrayOfQuestions.push(shuffledQuestionArray.slice(0, numberOfQuestions))
      })

      const flattenedArrayOfQuestions = shuffle(_.flatten(arrayOfQuestions))
      if (flattenedArrayOfQuestions.length > 0) {
        dispatch({ type: ActionTypes.RECEIVE_QUESTION_DATA, data: flattenedArrayOfQuestions, });
      } else {
        // we should only show no questions error if it is not a proofreader follow-up
        if (getState().session.proofreaderSession) {
          dispatch({ type: ActionTypes.RECEIVE_QUESTION_DATA, data: [] });
        } else {
          dispatch({ type: ActionTypes.NO_QUESTIONS_FOUND_FOR_SESSION})
        }
      }
      dispatch(setSessionPending(false))
    });

  }
}

export const getQuestions = (questions: any, flag: string) => {
  return dispatch => {
    dispatch(setSessionPending(true))
    QuestionApi.getAll(GRAMMAR_QUESTION_TYPE).then((allQuestions) => {
      const arrayOfQuestions = questions.map(q => {
        const question = allQuestions[q.key]
        question.uid = q.key
        return question
      })
      const arrayOfQuestionsFilteredByFlag = arrayOfQuestions.filter(q => permittedFlag(flag, q.flag))
      if (arrayOfQuestionsFilteredByFlag.length > 0) {
        dispatch({ type: ActionTypes.RECEIVE_QUESTION_DATA, data: arrayOfQuestionsFilteredByFlag, });
      } else {
        dispatch({ type: ActionTypes.NO_QUESTIONS_FOUND_FOR_SESSION})
      }
      dispatch(setSessionPending(false))
    })
  }
}

export const checkAnswer = (response: string, question: Question, responses: Response[], isFirstAttempt: Boolean) => {
  return dispatch => {
    const questionUID: string = question.uid
    const focusPoints = question.focusPoints ? hashToCollection(question.focusPoints).sort((a, b) => a.order - b.order) : [];
    const incorrectSequences = question.incorrectSequences ? hashToCollection(question.incorrectSequences) : [];
    const defaultConceptUID = question.modelConceptUID || question.concept_uid
    const responseObj = checkGrammarQuestion(questionUID, response, responses, focusPoints, incorrectSequences, defaultConceptUID)
    responseObj.feedback = responseObj.feedback && responseObj.feedback !== '<br/>' ? responseObj.feedback : "<b>Try again!</b> Unfortunately, that answer is not correct."
    dispatch(responseActions.submitResponse(responseObj, null, isFirstAttempt))
    delete responseObj.parent_id
    dispatch(submitResponse(responseObj))
  }
}

export const removeGrammarSession = (sessionId: string) => {
  sessionsRef.child(sessionId).remove()
}

export const removeProofreaderSession = (sessionId: string) => {
  proofreaderSessionsRef.child(sessionId).remove()
}

export const goToNextQuestion = () => {
  return dispatch => {
    dispatch({ type: ActionTypes.GO_T0_NEXT_QUESTION })
  }
}

export const submitResponse = (response: Response) => {
  return dispatch => {
    dispatch({ type: ActionTypes.SUBMIT_RESPONSE, response })
  }
}

export const setSessionReducer = (session: SessionState) => {
  return dispatch => {
    dispatch({ type: ActionTypes.SET_SESSION, session})
  }
}

export const saveProofreaderSessionToReducer = (proofreaderSession) => {
  return dispatch => {
    dispatch({ type: ActionTypes.SET_PROOFREADER_SESSION_TO_REDUCER, data: proofreaderSession})
  }
}

export const setSessionPending = (pendingStatus: boolean) => {
  return dispatch => {
    dispatch({ type: ActionTypes.SET_SESSION_PENDING, pending: pendingStatus })
  }
}

export const startNewSession = () => {
  return (dispatch) => {
    dispatch({ type: ActionTypes.START_NEW_SESSION, })
    dispatch({ type: ActionTypes.START_NEW_ACTIVITY, })
  }
}