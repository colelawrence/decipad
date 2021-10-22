import { chakra } from '@chakra-ui/system';
import { Box } from '@chakra-ui/react';
import { Type, InBlockResult, OptionalValueLocation } from '@decipad/language';
import { useResults } from '@decipad/ui';

import { NumberResult } from './NumberResult';
import { DateResult } from './DateResult';
import { ColumnResult } from './ColumnResult';
import { TableResult } from './TableResult';
import { RangeResult } from './RangeResult';

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
    return (
      <>
        <NumberResult value={value} />
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
  if (type.rangeOf) {
    return <RangeResult {...props} />;
  }
  return null;
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
  <ResultStyles contentEditable={false}>&nbsp;</ResultStyles>
);

export const Result = ({
  blockId,
}: {
  blockId: string;
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
    return (
      <ResultStyles contentEditable={false}>
        <ResultContent type={lineResult.valueType} value={lineResult.value} />
      </ResultStyles>
    );
  }
  return <NilResult />;
};
