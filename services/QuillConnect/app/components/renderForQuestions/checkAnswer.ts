declare function require(name:string);
import { hashToCollection } from 'quill-component-library/dist/componentLibrary';
import * as _ from 'underscore'
import {checkSentenceCombining, checkDiagnosticQuestion} from 'quill-marking-logic'
import { getParameterByName } from '../../libs/getParameterByName'

export default function checkAnswer(question, response, responses, mode='default') {
  console.log('report check answer interaction');
  console.log(getParameterByName('student'));
  const fields = {
    responses: responses ? hashToCollection(responses) : [],
    questionUID: question.key,
    focusPoints: question.focusPoints ? hashToCollection(question.focusPoints): [],
    incorrectSequences: question.incorrectSequences ? hashToCollection(_.compact(question.incorrectSequences)) : [],
  };
  const newResponse = mode === 'default'
    ? checkSentenceCombining(fields.questionUID, response, fields.responses, fields.focusPoints, fields.incorrectSequences)
    : checkDiagnosticQuestion(fields.questionUID, response, fields.responses)
  return {response: newResponse};
}
