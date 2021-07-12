import { chakra } from '@chakra-ui/system';
import { Box, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { Type, InBlockResult } from '@decipad/language';
import { ReactNode } from 'react';
import { format as dateFormat, formatISO as formatDateISO } from 'date-fns';
import { FiCalendar, FiHash, FiType, FiHelpCircle } from 'react-icons/fi';
import { useResults } from '@decipad/ui';
import { ValueLocation } from 'libs/language/src/computer/types';

const commonStyles = {
  py: 2,
  px: 6,
  d: 'inline-block',
  borderBottomRadius: 6,
  mb: 3,
};

export const ResultErrorStyles = chakra(Box, {
  baseStyle: {
    bg: 'red.100',
    color: 'red.500',
    fontWeight: 'bold',
    ...commonStyles,
  },
});

export const ResultStyles = chakra(Box, {
  baseStyle: {
    bg: 'rgb(252,252,263)',
    color: 'black',
    ...commonStyles,
    w: '100%',
  },
});

const ResultTable = chakra(Table, {
  baseStyle: {},
});

const TableHeader = chakra(Th, {
  baseStyle: {
    textTransform: 'none',
    fontSize: 'md',
    borderTop: 0,
    borderRight: '1px',
    borderColor: 'gray.100',
    color: 'black',
    wordWrap: 'no-wrap',
    bg: 'transparent',
  },
});

const HeaderIcon = chakra(Box, {
  baseStyle: {
    d: 'inline',
    color: 'gray.500',
    marginRight: '0.5em',
  },
});

const TableRow = chakra(Tr, {
  baseStyle: {
    borderBottom: '1px',
    borderBottomColor: 'gray.100',
  },
});

const TableCell = chakra(Td, {
  baseStyle: {
    bg: 'white',
    borderRight: '1px',
    borderColor: 'gray.100',
    px: 3,
    py: 2.5,
    borderBottom: 0,
  },
});

const commaSeparated = (list: ReactNode[]) =>
  list.flatMap((item, i) => {
    if (i === list.length - 1) return [item];
    else return [item, ', '];
  });

// Cannot be imported from @decipad/runtime
interface ComputationError {
  message: string;
  lineNumber?: number;
  columnNumber?: number;
}

interface ComputationResult {
  type: Type;
  value: any | any[];
  errors: ComputationError[];
}

interface ResultContentProps extends Pick<ComputationResult, 'type' | 'value'> {
  depth?: number;
}

const ResultContent = (props: ResultContentProps) => {
  const { type, value, depth = 0 } = props;
  if (type == null) return null;

  if (type.type === 'number' || type.type === 'boolean') {
    return (
      <>
        {String(value)}
        {type.unit ? ` ${type.toString()}` : ''}
      </>
    );
  } else if (type.date) {
    return <DateResult {...props} />;
  } else if (type.type === 'string') {
    return value;
  } else if (type.tupleTypes != null) {
    return TableResult(props);
  } else if (type.columnSize != null && Array.isArray(value)) {
    const columnItems = commaSeparated(
      value.map((item, i) => (
        <ResultContent
          key={i}
          type={type.reduced()}
          value={item}
          depth={depth + 1}
        />
      ))
    );

    return (
      <>
        {'[ '}
        {columnItems}
        {' ]'}
      </>
    );
  } else if (type.functionness) {
    return 'ƒ';
  } else {
    return null;
  }
};

const getLineResult = (
  cursor: ValueLocation | null,
  results: InBlockResult[]
) => {
  let underCursor = null;

  if (cursor != null) {
    underCursor = results.find(
      ({ blockId, statementIndex }) =>
        blockId === cursor[0] && statementIndex === cursor[1]
    );
  }

  return underCursor ?? results[results.length - 1];
};

export const Result = ({
  blockId,
}: {
  blockId: string;
}): JSX.Element | null => {
  const { cursor, blockResults } = useResults();

  const blockResult = blockResults[blockId];

  if (blockResult == null) return null;

  if (blockResult.isSyntaxError) {
    return <ResultErrorStyles contentEditable={false}>Error</ResultErrorStyles>;
  }

  if (blockResult.results.length === 0) return null;

  const { valueType, value } = getLineResult(cursor, blockResult.results);

  if (valueType.errorCause != null) {
    return (
      <ResultErrorStyles contentEditable={false}>
        {valueType.errorCause.message}
      </ResultErrorStyles>
    );
  } else if (value != null) {
    return (
      <ResultStyles contentEditable={false}>
        <ResultContent type={valueType} value={value} />
      </ResultStyles>
    );
  } else {
    return null;
  }
};

function DateResult({ type, value }: ResultContentProps) {
  const date = new Date(Array.isArray(value) ? value[0] : value);
  let format;
  switch (type.date) {
    case 'year': {
      format = 'uuuu';
      break;
    }
    case 'month': {
      format = 'MMM uuuu';
      break;
    }
    case 'day': {
      format = 'MMM do uuuu';
      break;
    }
  }

  const string = format ? dateFormat(date, format) : formatDateISO(date);
  return <span>{string}</span>;
}

function tableByRows(tupleNames: string[], columns: any[], tupleTypes: Type[]) {
  const hasMany = tupleTypes.length && !!tupleTypes[0].cellType;
  if (!hasMany) {
    columns = columns.map((value) => [value]);
  }
  const refCol = columns[0] || [];
  const rows = [];
  for (let index = 0; index < refCol.length; index++) {
    const row = [];
    for (const column of columns) {
      row.push(column[index]);
    }
    rows.push(row);
  }

  return {
    columnNames: tupleNames,
    rows,
  };
}

function TableResult({
  type,
  value,
  depth = 0,
}: ResultContentProps): JSX.Element {
  const table = tableByRows(type.tupleNames!, value, type.tupleTypes!);

  const border = {
    borderTopRadius: 6,
    borderCollapse: true,
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
              const t =
                type.tupleTypes![colIndex].cellType ||
                type.tupleTypes![colIndex];
              const lastColumn = table.columnNames.length === colIndex + 1;
              const headerProps = lastColumn
                ? {
                    borderRight: 0,
                  }
                : {};
              return (
                <TableHeader {...headerProps}>
                  <IconForType type={t} />
                  &nbsp;{columnName}
                </TableHeader>
              );
            })}
          </TableRow>
        </Thead>
        <Tbody>
          {table.rows.map((row, rowIndex) => {
            const lastRow = table.rows.length === rowIndex + 1;
            const rowProps = lastRow
              ? {
                  borderBottom: 0,
                }
              : {};
            return (
              <TableRow key={rowIndex} {...rowProps}>
                {row.map((cell, index) => {
                  const lastCell = row.length === index + 1;
                  const t =
                    type.tupleTypes![index].cellType || type.tupleTypes![index];
                  const cellProps = lastCell
                    ? {
                        borderRight: 0,
                      }
                    : {};
                  return (
                    <TableCell isNumeric={t.type === 'number'} {...cellProps}>
                      <ResultContent
                        key={index}
                        type={t!}
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
