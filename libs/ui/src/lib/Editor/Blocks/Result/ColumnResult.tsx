import { Box, Tbody } from '@chakra-ui/react';
import { Interpreter } from '@decipad/language';
import { InlineColumnResult } from '../../../../organisms';
import { ResultTable, TableRow, TableCell } from './tableStyles';
import { ResultContent } from './Result.component';
import { ResultTypeProps } from '../../../results';
import { useResults } from '../../../Contexts/Results';

export function ColumnResult({
  type,
  value,
  variant = 'block',
}: ResultTypeProps): JSX.Element | null {
  const { indexLabels } = useResults();

  if (variant === 'inline') {
    return <InlineColumnResult type={type} value={value} />;
  }

  const { indexedBy, cellType } = type;

  if (!cellType) return null;

  const border = {
    borderTopRadius: 6,
    border: '1px',
    borderColor: 'gray.100',
  };

  return (
    <Box {...border}>
      <ResultTable role="table">
        {/* TODO: Column caption should say the name of the variable (if there is one. */}
        <Tbody>
          {(value as Interpreter.ResultColumn).map((row, rowIndex) => {
            const labels = indexLabels.get(indexedBy ?? '');

            return (
              <TableRow key={rowIndex}>
                {labels && (
                  <TableCell isNumeric={false}>
                    <span style={{ color: 'gray' }}>{labels[rowIndex]}</span>
                  </TableCell>
                )}
                <TableCell isNumeric={cellType.type === 'number'}>
                  <ResultContent type={cellType} value={row} />
                </TableCell>
              </TableRow>
            );
          })}
        </Tbody>
      </ResultTable>
    </Box>
  );
}
