import { render } from '@testing-library/react';
import { TdElement } from './Td';

describe('Editor Td Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <table>
        <tbody>
          <tr>
            <TdElement
              attributes={{
                'data-slate-leaf': true,
                'data-slate-node': 'element',
              }}
              leaf={{ text: '' }}
              text={{ text: '' }}
              nodeProps={{ styles: { root: { css: null } } }}
            >
              Td Element
            </TdElement>
          </tr>
        </tbody>
      </table>
    );

    expect(getByText('Td Element')).toBeVisible();
  });
});
