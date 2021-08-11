import { render } from '@testing-library/react';
import { TitleElement } from './Title';

describe('Editor Title Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <TitleElement
        attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
        leaf={{ text: '' }}
        text={{ text: '' }}
        nodeProps={{ styles: { root: { css: null } } }}
      >
        Title Element
      </TitleElement>
    );

    getByText('Title Element');
  });
});
