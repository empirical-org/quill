import React from 'react';
import { mount } from 'enzyme';

import CollegeBoard from '../college_board';

describe('CollegeBoard component', () => {

  it('should render', () => {
    const wrapper = mount(<CollegeBoard />);
    expect(wrapper).toMatchSnapshot()
  });

});
