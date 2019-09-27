import React from 'react';
import { shallow } from 'enzyme';

import AssignmentCard from '../assignment_card';

const props = {
  link: "http://localhost:3000/diagnostic/-LKX2sTTnPVhTOrWyUx9/stage/3",
  buttonText: "Preview",
  buttonLink: "https://diagnostic.quill.org/#/play/diagnostic/-LKX2sTTnPVhTOrWyUx9",
  header: "Starter Diagnostic",
  imgSrc: "http://localhost:45537/images/illustrations/diagnostics-starter.svg",
  imgAlt: "page with a little writing",
  bodyArray: [
    {
      key: "What",
      text: "Plural and possessive nouns, pronouns, verbs, adjectives, adverbs of manners, commas, prepositions, and capitalization"
    }, {
      key: "When",
      text: "Your students are working on basic grammar concepts."
    }
  ]
}

describe('AssignmentCard component', () => {

  it('should render', () => {
    expect(shallow(<AssignmentCard {...props} />)).toMatchSnapshot();
  });

});
