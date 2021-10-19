import { render } from '@testing-library/react';
import { TableElement } from './Table';

describe('Editor Table Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <TableElement>
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
