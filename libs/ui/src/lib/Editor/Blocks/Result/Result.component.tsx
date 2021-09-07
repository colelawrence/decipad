// Too much problematic code, hopeless to fix until this component is migrated
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { chakra } from '@chakra-ui/system';
import { format as formatDate, utcToZonedTime } from 'date-fns-tz';
import { Box, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { FiCalendar, FiHash, FiType, FiHelpCircle } from 'react-icons/fi';
import {
  Type,
  InBlockResult,
  Interpreter,
  ValueLocation,
} from '@decipad/language';
import { useResults } from '@decipad/ui';

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

const UnselectableCommaStyles = chakra(Box, {
  baseStyle: {
    userSelect: 'none',
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
    _last: {
      borderRight: 0,
    },
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
    _last: {
      borderBottom: 0,
    },
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
    _last: {
      borderRight: 0,
    },
  },
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

export const ResultContent = (props: ResultContentProps) => {
  const { type, value } = props;
  if (type == null) return null;

  if (type.type === 'number') {
    return (
      <>
        <ResultNumber value={value} />
        {type.unit ? ` ${type.toString()}` : ''}
      </>
    );
  }
  if (type.type === 'boolean' || type.type === 'string') {
    return <>{String(value)}</>;
  }
  if (type.date) {
    return <DateResult {...props} />;
  }
  if (type.columnTypes != null) {
    return <TableResult {...props} />;
  }
  if (type.columnSize != null && Array.isArray(value)) {
    return <ColumnResult {...props} />;
  }
  if (type.functionness) {
    return <>ƒ</>;
  }
  return null;
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
  }
  if (value != null) {
    return (
      <ResultStyles contentEditable={false}>
        <ResultContent type={valueType} value={value} />
      </ResultStyles>
    );
  }
  return null;
};

const commatizeEveryThreeDigits = (digits: string) => {
  const numLeadingDigits = digits.length % 3 || 3;

  const segments = [];

  if (numLeadingDigits > 0) {
    segments.push(digits.slice(0, numLeadingDigits));
  }

  for (let i = numLeadingDigits; i < digits.length; i += 3) {
    const threeDigits = digits.slice(i, i + 3);

    segments.push(
      <UnselectableCommaStyles as="span" key={i}>
        ,
      </UnselectableCommaStyles>
    );
    segments.push(threeDigits);
  }

  return segments;
};

const removeFpArtifacts = (decimalPart: string) => {
  if (decimalPart.length > 8) {
    // Round to 8 places. If the rounding ends in zeroes,
    // that's a heuristic telling us that the FP error has
    // probably been eliminated
    const rounded = Number(`0${decimalPart}`).toFixed(8);

    const [, digits, zeroes] = rounded.match(/0\.(\d+?)(0+)$/) ?? [];
    if (digits && zeroes) {
      return `.${digits}`;
    }
  }

  return decimalPart;
};

export const ResultNumber = ({ value }: { value: number }) => {
  const asString = String(value);

  // Numbers' toString isn't always formatted like [-]####.###
  const basicNumberMatch = asString.match(/^(-?)(\d+)(\.\d+)?$/);
  if (basicNumberMatch != null) {
    const [, sign, integerPart, decimalPart] = basicNumberMatch;

    const formattedIntegerPart =
      integerPart.length > 3
        ? commatizeEveryThreeDigits(integerPart)
        : integerPart;

    return (
      <>
        {sign}
        {formattedIntegerPart}
        {decimalPart && removeFpArtifacts(decimalPart)}
      </>
    );
  }

  return <>{asString}</>;
};

export const formatUTCDate = (date: Date, form: string): string => {
  const zonedDate = utcToZonedTime(date, 'UTC');
  return formatDate(zonedDate, form, { timeZone: 'UTC' });
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
    case 'time': {
      if (date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0) {
        format = 'MMM do uuuu kk:mm';
      }
      break;
    }
  }

  const string = format ? formatUTCDate(date, format) : date.toISOString();
  return <span>{string}</span>;
}

function tableByRows(
  { columnNames, columnTypes, tableLength }: Type,
  columnsOrCells: any[]
) {
  const rows = [];
  for (let index = 0; index < tableLength!; index += 1) {
    const row = [];
    for (const column of columnsOrCells) {
      row.push(column[index]);
    }
    rows.push(row);
  }

  return { columnTypes: columnTypes!, columnNames: columnNames!, rows };
}

function TableResult({
  type,
  value,
  depth = 0,
}: ResultContentProps): JSX.Element {
  const table = tableByRows(type, value);
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

function ColumnResult({
  type,
  value,
  depth = 0,
}: ResultContentProps): JSX.Element {
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
          {(value as Interpreter.ResultColumn).map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell isNumeric={type.cellType!.type === 'number'}>
                <ResultContent
                  type={type.cellType!}
                  value={row}
                  depth={depth + 1}
                />
              </TableCell>
            </TableRow>
          ))}
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
