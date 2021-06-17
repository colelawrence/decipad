import { Box } from '@chakra-ui/react';
import { chakra } from '@chakra-ui/system';
import { Type } from '@decipad/language';
import React, { Fragment, ReactNode } from 'react';

const commonStyles = {
  py: 2,
  px: 6,
  d: 'inline-block',
  borderBottomRadius: 6,
  fontWeight: 'bold',
  mb: 3,
};

export const ResultErrorStyles = chakra(Box, {
  baseStyle: {
    bg: 'red.100',
    color: 'red.500',
    ...commonStyles,
  },
});

export const ResultStyles = chakra(Box, {
  baseStyle: {
    bg: 'green.100',
    color: 'green.500',
    ...commonStyles,
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

const ResultContent = ({ type, value, depth = 0 }: ResultContentProps) => {
  if (type == null) return null;

  if (type.type === 'number' || type.type === 'boolean') {
    return (
      <>
        {String(value)}
        {type.unit ? ` ${type.toString()}` : ''}
      </>
    );
  } else if (type.date) {
    return <>{new Date(value).toISOString()}</>;
  } else if (type.type === 'string') {
    return <>"{value}"</>;
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
  } else if (type.tupleTypes != null && Array.isArray(value)) {
    const columns = commaSeparated(
      value.map((item, i) => {
        const key = type.tupleNames ? `${type.tupleNames[i]} = ` : '';
        return (
          <Fragment key={i}>
            {key}
            <ResultContent
              key={i}
              type={type.tupleTypes![i]}
              value={item}
              depth={depth + 1}
            />
          </Fragment>
        );
      })
    );

    return (
      <>
        {'{ '}
        {columns}
        {' }'}
      </>
    );
  } else if (type.functionness) {
    return <>ƒ</>;
  } else {
    return null;
  }
};

export const Result = ({
  type,
  value,
  errors,
}: ComputationResult): JSX.Element | null => {
  if (errors?.length > 0) {
    return (
      <ResultErrorStyles contentEditable={false}>
        {errors.map((e) => e.message)}
      </ResultErrorStyles>
    );
  } else if (type?.errorCause != null) {
    return (
      <ResultErrorStyles contentEditable={false}>
        {type.errorCause.message}
      </ResultErrorStyles>
    );
  } else if (type != null && value != null) {
    return (
      <ResultStyles contentEditable={false}>
        <ResultContent type={type} value={value[0]} />
      </ResultStyles>
    );
  } else {
    return null;
  }
};
