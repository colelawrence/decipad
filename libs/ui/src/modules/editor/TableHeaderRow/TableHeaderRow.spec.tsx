import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableHeader } from '../TableHeader/TableHeader';
import { getStringType } from '../../../utils';
import { TableHeaderRow } from './TableHeaderRow';

it('renders a table data', () => {
  render(
    <table>
      <tbody>
        <TableHeaderRow>
          <TableHeader type={getStringType()}>Table Data</TableHeader>
        </TableHeaderRow>
      </tbody>
    </table>
  );

  expect(screen.getByText('Table Data')).toBeVisible();
});
