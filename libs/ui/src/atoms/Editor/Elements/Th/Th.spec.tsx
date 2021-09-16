import { render } from '@testing-library/react';
import { ThElement } from './Th';

describe('Editor Th Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <table>
        <thead>
          <ThElement
            attributes={{
              'data-slate-leaf': true,
              'data-slate-node': 'element',
            }}
            leaf={{ text: '' }}
            text={{ text: '' }}
            nodeProps={{ styles: { root: { css: null } } }}
          >
            Th Element
          </ThElement>
        </thead>
      </table>
    );

    expect(getByText('Th Element')).toBeVisible();
  });
});
