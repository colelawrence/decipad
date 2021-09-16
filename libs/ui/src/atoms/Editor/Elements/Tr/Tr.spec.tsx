import { render } from '@testing-library/react';
import { TrElement } from './Tr';

describe('Editor Tr Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <table>
        <tbody>
          <TrElement
            attributes={{
              'data-slate-leaf': true,
              'data-slate-node': 'element',
            }}
            leaf={{ text: '' }}
            text={{ text: '' }}
            nodeProps={{ styles: { root: { css: null } } }}
          >
            <td>Tr Element</td>
          </TrElement>
        </tbody>
      </table>
    );

    expect(getByText('Tr Element')).toBeVisible();
  });
});
