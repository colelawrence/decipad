import { render, screen } from '@testing-library/react';
import { TableFormulaCell } from './TableFormulaCell';

it('renders the text', () => {
  render(
    <table>
      <tbody>
        <tr>
          <TableFormulaCell>Td Element</TableFormulaCell>
        </tr>
      </tbody>
    </table>
  );

  expect(screen.getByText('Td Element')).toBeVisible();
});
