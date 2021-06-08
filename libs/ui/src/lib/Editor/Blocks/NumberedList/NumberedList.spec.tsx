import { ListItem } from '@chakra-ui/layout';
import React from 'react';
import { render } from 'test-utils';
import { NumberedList } from './NumberedList.component';

describe('NumberedList Block', () => {
  it('renders', () => {
    const { container, getByText } = render(
      <NumberedList
        element={{ children: [] }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        <ListItem>Hello World</ListItem>
      </NumberedList>
    );

    expect(container).toBeDefined();
    getByText('Hello World');
  });

  it('matches snapshot', () => {
    const { container } = render(
      <NumberedList
        element={{ children: [] }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        <ListItem>Hello World</ListItem>
      </NumberedList>
    );

    expect(container).toMatchSnapshot();
  });
});
