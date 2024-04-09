import type { PlatePlugin } from '@udecode/plate-common';
import { TableProvider, TableRowProvider } from '../contexts/tableStore';

export const TableAboveEditable: PlatePlugin['renderAboveEditable'] = ({
  children,
}) => {
  return (
    <TableProvider>
      <TableRowProvider>{children}</TableRowProvider>
    </TableProvider>
  );
};
