import { Box, Tbody, Thead } from '@chakra-ui/react';
import { Type } from '@decipad/language';
import { FiCalendar, FiHash, FiType, FiHelpCircle } from 'react-icons/fi';

import {
  ResultTable,
  TableRow,
  TableCell,
  TableHeader,
  HeaderIcon,
} from './tableStyles';
import { ResultContent, ResultContentProps } from './Result.component';

function IconForType({ type }: { type: Type }): JSX.Element {
  let Icon;
  if (type.date) {
    Icon = FiCalendar;
  } else if (type.type === 'number') {
    Icon = FiHash;
  } else if (type.type === 'boolean') {
    Icon = FiHelpCircle;
  } else {
    Icon = FiType;
  }

  return (
    <HeaderIcon>
      <Icon style={{ display: 'inline', verticalAlign: 'text-top' }} />
    </HeaderIcon>
  );
}

function tableByRows(
  columnNames: string[],
  columnTypes: Type[],
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  columnsOrCells: any[]
) {
  const rows = [];
  for (let index = 0; index < columnsOrCells[0]?.length ?? 0; index += 1) {
    const row = [];
    for (const column of columnsOrCells) {
      row.push(column[index]);
    }
    rows.push(row);
  }

  return { columnTypes, columnNames, rows };
}

export function TableResult({
  type: { columnNames, columnTypes },
  value,
  depth = 0,
}: ResultContentProps): JSX.Element | null {
  if (!columnNames || !columnTypes) return null;

  const table = tableByRows(columnNames, columnTypes, value);
  const border = {
    borderTopRadius: 6,
    border: '1px',
    borderColor: 'gray.100',
  };

  return (
    <Box {...border}>
      <ResultTable>
        {/* TODO: table caption should say the name of the variable (if there is one. */}
        <Thead>
          <TableRow>
            {table.columnNames.map((columnName, colIndex) => {
              const t = table.columnTypes[colIndex];

              return (
                <TableHeader key={colIndex}>
                  <IconForType type={t} />
                  &nbsp;{columnName}
                </TableHeader>
              );
            })}
          </TableRow>
        </Thead>
        <Tbody>
          {table.rows.map((row, rowIndex) => {
            return (
              <TableRow key={rowIndex}>
                {row.map((cell, index) => {
                  const t = table.columnTypes[index];
                  return (
                    <TableCell key={index} isNumeric={t.type === 'number'}>
                      <ResultContent
                        key={index}
                        type={t}
                        value={cell}
                        depth={depth + 1}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </Tbody>
      </ResultTable>
    </Box>
  );
}
