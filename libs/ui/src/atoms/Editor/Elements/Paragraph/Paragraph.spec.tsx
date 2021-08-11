import { render } from '@testing-library/react';
import { ParagraphElement } from './Paragraph';

describe('Editor Paragraph Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <ParagraphElement
        attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
        leaf={{ text: '' }}
        text={{ text: '' }}
        nodeProps={{ styles: { root: { css: null } } }}
      >
        Paragraph Element
      </ParagraphElement>
    );

    getByText('Paragraph Element');
  });
});
