import { render } from '@testing-library/react';
import { SubtitleElement } from './Subtitle';

describe('Editor Subtitle Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <SubtitleElement
        attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
        leaf={{ text: '' }}
        text={{ text: '' }}
        nodeProps={{ styles: { root: { css: null } } }}
      >
        Subtitle Element
      </SubtitleElement>
    );

    expect(getByText('Subtitle Element')).toBeVisible();
  });
});
