import { render } from '@testing-library/react';
import { TableFormulaCell } from './TableFormulaCell';

it('renders the text', () => {
  const { getByText } = render(
    <table>
      <tbody>
        <tr>
          <TableFormulaCell>Td Element</TableFormulaCell>
        </tr>
      </tbody>
    </table>
  );

  expect(getByText('Td Element')).toBeVisible();
});
