import { render } from '@testing-library/react';
import { UnorderedListElement } from './UnorderedList';

describe('Editor Unordered List Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <UnorderedListElement
        attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
        leaf={{ text: '' }}
        text={{ text: '' }}
        nodeProps={{ styles: { root: { css: null } } }}
      >
        Unordered List Element
      </UnorderedListElement>
    );

    expect(getByText('Unordered List Element')).toBeVisible();
  });
});
