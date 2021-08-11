import { render } from '@testing-library/react';
import { SubheadingElement } from './Subheading';

describe('Editor Subheading Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <SubheadingElement
        attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
        leaf={{ text: '' }}
        text={{ text: '' }}
        nodeProps={{ styles: { root: { css: null } } }}
      >
        Subheading Element
      </SubheadingElement>
    );

    getByText('Subheading Element');
  });
});
