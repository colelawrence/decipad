import { ListItem } from '@chakra-ui/react';
import React from 'react';
import { render } from 'test-utils';
import { BulletList } from './BulletList.component';

describe('BulletList Block', () => {
  it('renders', () => {
    const { container } = render(
      <BulletList
        element={{
          children: [{ text: 'The quick brown fox jumps over the lazy dog.' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        <ListItem>The quick brown fox jumps over the lazy dog.</ListItem>
      </BulletList>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <BulletList
        element={{
          children: [{ text: 'The quick brown fox jumps over the lazy dog.' }],
        }}
        attributes={{ 'data-slate-node': 'element', ref: null }}
      >
        <ListItem>The quick brown fox jumps over the lazy dog.</ListItem>
      </BulletList>
    );

    expect(container).toMatchSnapshot();
  });
});
