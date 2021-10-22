import { Box, Tbody } from '@chakra-ui/react';
import { Interpreter } from '@decipad/language';
import { ResultTable, TableRow, TableCell } from './tableStyles';
import { ResultContent, ResultContentProps } from './Result.component';
import { useResults } from '../../../Contexts/Results';

export function ColumnResult({
  type: { indexedBy, cellType },
  value,
  depth = 0,
}: ResultContentProps): JSX.Element | null {
  const { indexLabels } = useResults();

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
                  <ResultContent
                    type={cellType}
                    value={row}
                    depth={depth + 1}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </Tbody>
      </ResultTable>
    </Box>
  );
}
