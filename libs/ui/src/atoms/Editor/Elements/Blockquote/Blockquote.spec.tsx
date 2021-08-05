import { render } from '@testing-library/react';
import { BlockquoteElement } from './Blockquote';

describe('Editor Blockquote Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <BlockquoteElement
        attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
        leaf={{ text: '' }}
        text={{ text: '' }}
        nodeProps={{ styles: { root: { css: null } } }}
      >
        Blockquote Element
      </BlockquoteElement>
    );

    expect(getByText('Blockquote Element')).toBeVisible();
  });
});
