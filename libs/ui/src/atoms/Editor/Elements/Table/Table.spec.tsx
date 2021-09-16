import { render } from '@testing-library/react';
import { TableElement } from './Table';

describe('Editor Table Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <TableElement
        attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
        leaf={{ text: '' }}
        text={{ text: '' }}
        nodeProps={{ styles: { root: { css: null } } }}
      >
        <tbody>
          <tr>
            <td>Table Element</td>
          </tr>
        </tbody>
      </TableElement>
    );

    expect(getByText('Table Element')).toBeVisible();
  });
});
