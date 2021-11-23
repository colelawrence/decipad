/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { chakra } from '@chakra-ui/system';
import { Box } from '@chakra-ui/react';
import { Type, InBlockResult, OptionalValueLocation } from '@decipad/language';
import { useResults } from '@decipad/ui';

import { DateResult, NumberResult, TimeUnitsResult } from '../../../../atoms';
import { RangeResult } from '../../../../organisms';

import { ColumnResult } from './ColumnResult';
import { TableResult } from './TableResult';

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

export const DefaultResultStyles = chakra(Box, {
  baseStyle: {
    bg: 'rgb(252,252,263)',
    color: 'black',
    ...commonStyles,
    w: '100%',
  },
});

export interface ResultContentProps {
  type: Type;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  value: any | any[];
  depth?: number;
}

export const ResultContent = (props: ResultContentProps) => {
  const { type, value } = props;
  if (type == null) return null;

  if (type.type === 'number') {
    return <NumberResult {...props} />;
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
  if (type.timeUnits) {
    return <TimeUnitsResult {...props} />;
  }
  if (type.rangeOf) {
    return <RangeResult {...props} />;
  }
  return value.toString();
};

const getLineResult = (
  currentBlockId: string,
  cursor: OptionalValueLocation | null,
  results: InBlockResult[]
) => {
  let underCursor = null;

  if (cursor != null) {
    underCursor = results.find(
      ({ blockId, statementIndex }) =>
        blockId === cursor[0] && statementIndex === cursor[1]
    );
  }

  if (currentBlockId === cursor?.[0] && cursor?.[1] === null) {
    return null;
  }

  return underCursor ?? results[results.length - 1];
};

const NilResult = () => (
  <DefaultResultStyles contentEditable={false}>&nbsp;</DefaultResultStyles>
);

export const Result = ({
  blockId,
  useDefaultStyles = true,
}: {
  blockId: string;
  useDefaultStyles?: boolean;
}): JSX.Element | null => {
  const { cursor, blockResults } = useResults();

  const blockResult = blockResults[blockId];

  if (blockResult == null) {
    return <NilResult />;
  }

  if (blockResult.isSyntaxError) {
    return <ResultErrorStyles contentEditable={false}>Error</ResultErrorStyles>;
  }

  if (blockResult.results.length === 0) {
    return <NilResult />;
  }

  const lineResult = getLineResult(blockId, cursor, blockResult.results);
  if (lineResult?.valueType.errorCause != null) {
    return (
      <ResultErrorStyles contentEditable={false}>
        {lineResult?.valueType.errorCause.message}
      </ResultErrorStyles>
    );
  }
  if (lineResult?.value != null) {
    const result = (
      <ResultContent type={lineResult.valueType} value={lineResult.value} />
    );
    const resultWithStyles = useDefaultStyles ? (
      <DefaultResultStyles>{result}</DefaultResultStyles>
    ) : (
      result
    );
    return <div contentEditable={false}>{resultWithStyles}</div>;
  }
  return <NilResult />;
};
