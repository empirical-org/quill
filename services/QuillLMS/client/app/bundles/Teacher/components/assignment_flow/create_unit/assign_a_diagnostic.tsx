import * as React from 'react';
import AssignmentCard from './assignment_card';
import AssignmentFlowNavigation from '../assignment_flow_navigation'
import { UNIT_TEMPLATE_NAME, UNIT_TEMPLATE_ID, ACTIVITY_IDS_ARRAY, UNIT_NAME, } from '../localStorageKeyConstants'
import ScrollToTop from '../../shared/scroll_to_top'

const starterDiagnosticSrc = `${process.env.CDN_URL}/images/illustrations/diagnostics-starter.svg`
const intermediateDiagnosticSrc = `${process.env.CDN_URL}/images/illustrations/diagnostics-intermediate.svg`
const advancedDiagnosticSrc = `${process.env.CDN_URL}/images/illustrations/diagnostics-advanced.svg`
const ellDiagnosticSrc = `${process.env.CDN_URL}/images/illustrations/diagnostics-ell.svg`
const ellStarterDiagnosticSrc = `${process.env.CDN_URL}/images/illustrations/diagnostics-ell-starter.svg`
const preApWritingSkillsSrc = `${process.env.CDN_URL}/images/college_board/diagnostics-preap.svg`
const apWritingSkillsSrc = `${process.env.CDN_URL}/images/college_board/diagnostics-ap.svg`

const STARTER_DIAGNOSTIC = 'Starter Diagnostic'
const INTERMEDIATE_DIAGNOSTIC = 'Intermediate Diagnostic'
const ADVANCED_DIAGNOSTIC = 'Advanced Diagnostic'
const ELL_DIAGNOSTIC = 'ELL Diagnostic (Level 2 - Expanding)'
const ELL_STARTER_DIAGNOSTIC = 'ELL Starter Diagnostic (Level 1 - Emerging)'
const PRE_AP_WRITINGS_SKILLS_1 = 'Pre-AP Writing Skills Survey 1'
const PRE_AP_WRITINGS_SKILLS_2 = 'Pre-AP Writing Skills Survey 2'
const AP_WRITINGS_SKILLS = 'AP Writing Skills Survey'

const selectCard = (history: any, unitTemplateName: string, activityIdsArray: string, unitTemplateId: number) => {
  const unitTemplateIdString = unitTemplateId.toString();
  window.localStorage.setItem(UNIT_TEMPLATE_NAME, unitTemplateName)
  window.localStorage.setItem(UNIT_NAME, unitTemplateName)
  window.localStorage.setItem(ACTIVITY_IDS_ARRAY, activityIdsArray)
  window.localStorage.setItem(UNIT_TEMPLATE_ID, unitTemplateIdString)
  history.push(`/assign/select-classes?diagnostic_unit_template_id=${unitTemplateIdString}`)
}

const minis = ({ history }) => [
  (<AssignmentCard
    bodyArray={[
      { key: 'What', text: 'Plural and possessive nouns, pronouns, verbs, adjectives, adverbs of manner, commas, prepositions, and capitalization', },
      { key: 'When', text: 'Your students are working on basic grammar concepts.', }
    ]}
    buttonLink="https://diagnostic.quill.org/#/play/diagnostic/-LKX2sTTnPVhTOrWyUx9"
    buttonText="Preview"
    header={STARTER_DIAGNOSTIC}
    imgAlt="page with a little writing"
    imgSrc={starterDiagnosticSrc}
    selectCard={() => selectCard(history, STARTER_DIAGNOSTIC, encodeURIComponent([849].toString()), 99)}
  />),
  (<AssignmentCard
    bodyArray={[
      { key: 'What', text: 'Compound sentences, complex sentences, conjunctive adverbs, pronouns, and commonly confused words', },
      { key: 'When', text: 'Your students have practiced the basics of grammar and are ready to develop their sentence construction skills.', }
    ]}
    buttonLink="https://diagnostic.quill.org/#/play/diagnostic/-LKbzH_Er916zGjgHk5U"
    buttonText="Preview"
    header={INTERMEDIATE_DIAGNOSTIC}
    imgAlt="page with a medium amount of writing"
    imgSrc={intermediateDiagnosticSrc}
    selectCard={() => selectCard(history, INTERMEDIATE_DIAGNOSTIC, encodeURIComponent([850].toString()), 100)}
  />),
  (<AssignmentCard
    bodyArray={[
      { key: 'What', text: 'Compound-complex sentences, appositive phrases, relative clauses, participial phrases, and parallel structure', },
      { key: 'When', text: 'Your students are experienced with Quill, understand sentence combining, and are ready to develop multi-clause sentences.', }
    ]}
    buttonLink="https://diagnostic.quill.org/#/play/diagnostic/-LVxlcVPdW5DvAh_xgnj"
    buttonText="Preview"
    header={ADVANCED_DIAGNOSTIC}
    imgAlt="page with a large amount of writing"
    imgSrc={advancedDiagnosticSrc}
    selectCard={() => selectCard(history, ADVANCED_DIAGNOSTIC, encodeURIComponent([888].toString()), 126)}
  />),
  (<AssignmentCard
    bodyArray={[
      { key: 'What', text: 'Simple verb conjugation, articles, subject-verb agreement, simple word order, singular and plural nouns, and adjective placement', },
      { key: 'When', text: 'Your students are beginning English language learners who are working on foundational grammar skills.', }
    ]}
    buttonLink="https://diagnostic.quill.org/#/play/diagnostic/-LyFRZvbHAmooTTIIVE2"
    buttonText="Preview"
    header={ELL_STARTER_DIAGNOSTIC}
    imgAlt="page with less writing that says ELL in the corner"
    imgSrc={ellStarterDiagnosticSrc}
    selectCard={() => selectCard(history, ELL_STARTER_DIAGNOSTIC, encodeURIComponent([1161].toString()), 154)}
  />),
  (<AssignmentCard
    bodyArray={[
      { key: 'What', text: 'Subject-verb agreement, verb tense, adjectives, adverbs, articles, and prepositions', },
      { key: 'When', text: 'Your students are English language learners at the developing, expanding, or bridging stages of language proficiency.', }
    ]}
    buttonLink="https://diagnostic.quill.org/#/play/diagnostic/ell"
    buttonText="Preview"
    header={ELL_DIAGNOSTIC}
    imgAlt="page with writing that says ELL in the corner"
    imgSrc={ellDiagnosticSrc}
    selectCard={() => selectCard(history, ELL_DIAGNOSTIC, encodeURIComponent([447].toString()), 34)}
  />),
  (<AssignmentCard
    bodyArray={[
      { key: 'What', text: 'Subject-verb agreement, pronouns, compound subjects, objects, and predicates, and compound and complex sentences', },
      { key: 'When', text: 'Your students are working on basic sentence patterns and the skills outlined in the Pre-AP® English High School Course Framework.', }
    ]}
    buttonLink="https://diagnostic.quill.org/#/play/diagnostic/-M2nZy22Ey5g75LVsH25"
    buttonText="Preview"
    header={PRE_AP_WRITINGS_SKILLS_1}
    imgAlt="page with writing that says Pre-AP on bottom"
    imgSrc={preApWritingSkillsSrc}
    selectCard={() => selectCard(history, PRE_AP_WRITINGS_SKILLS_1, encodeURIComponent([1229].toString()), 194)}
  />),
  (<AssignmentCard
    bodyArray={[
      { key: 'What', text: 'Conjunctive adverbs, relative clauses, appositive phrases, participial phrases, and parallel structure', },
      { key: 'When', text: 'Your students are working on basic sentence patterns and the skills outlined in the Pre-AP® English High School Course Framework.', }
    ]}
    buttonLink="https://diagnostic.quill.org/#/play/diagnostic/-M2ngd3CX44IwmKr_PY7"
    buttonText="Preview"
    header={PRE_AP_WRITINGS_SKILLS_2}
    imgAlt="page with writing that says Pre-AP on bottom"
    imgSrc={preApWritingSkillsSrc}
    selectCard={() => selectCard(history, PRE_AP_WRITINGS_SKILLS_2, encodeURIComponent([1230].toString()), 195)}
  />),
  (<AssignmentCard
    bodyArray={[
      { key: 'What', text: 'Compound-complex sentences, appositive phrases, relative clauses, participial phrases, and parallel structure', },
      { key: 'When', text: 'Your students are developing their advanced sentence-level writing skills to prepare for writing in an AP® classroom.', }
    ]}
    buttonLink="https://diagnostic.quill.org/#/play/diagnostic/-L_wPCxbrT6toCb1fnYR"
    buttonText="Preview"
    header={AP_WRITINGS_SKILLS}
    imgAlt="page with writing that says AP in corner"
    imgSrc={apWritingSkillsSrc}
    selectCard={() => selectCard(history, AP_WRITINGS_SKILLS, encodeURIComponent([992].toString()), 193)}
  />)
];

const AssignADiagnostic = (props: any) => (
  <div className="assignment-flow-container">
    <AssignmentFlowNavigation />
    <ScrollToTop />
    <div className="diagnostic-page container">
      <h1>Which diagnostic covers the skills you want to assess?</h1>
      <div className="minis">{minis(props)}</div>
    </div>
  </div>
);

export default AssignADiagnostic
