import { Box } from '@chakra-ui/react';
import { chakra } from '@chakra-ui/system';
import { Type } from '@decipad/language';
import React, { Fragment } from 'react';

export const ResultError = chakra(Box, {
  baseStyle: {
    bg: 'red.100',
    color: 'red.500',
    py: 2,
    px: 6,
    d: 'inline-block',
    borderBottomRadius: 6,
    fontWeight: 'bold',
  },
});

export const SingleResultStyles = chakra(Box, {
  baseStyle: {
    bg: 'green.100',
    color: 'green.500',
    py: 2,
    px: 6,
    d: 'inline-block',
    borderBottomRadius: 6,
    fontWeight: 'bold',
  },
});

// Cannot be imported from @decipad/runtime
interface ComputationResult {
  type: Type;
  value: any | any[];
}

interface ResultContentProps extends ComputationResult {
  depth?: number;
}

const ResultContent = ({ type, value, depth = 0 }: ResultContentProps) => {
  if (type == null) return null;

  if (type.type === 'number' || type.type === 'boolean') {
    const unitStr = type.toString();
    return (
      <>
        {String(value)}
        {type.unit ? ` ${unitStr}` : ''}
      </>
    );
  } else if (type.type === 'string') {
    return <>"{value}"</>;
  } else if (type.columnSize != null && Array.isArray(value)) {
    return (
      <>
        [{' '}
        {value.map((item, i) => {
          const isLast = i === value.length - 1;
          return (
            <Fragment key={i}>
              <ResultContent
                key={i}
                type={type.reduced()}
                value={item}
                depth={depth + 1}
              />
              {isLast ? null : ', '}
            </Fragment>
          );
        })}{' '}
        ]
      </>
    );
  } else {
    return null;
  }
};

export const Result = ({
  type,
  value,
}: ComputationResult): JSX.Element | null => {
  if (type?.errorCause != null) {
    return (
      <ResultError contentEditable={false}>
        {type.errorCause.message}
      </ResultError>
    );
  } else if (type != null && value != null) {
    return (
      <SingleResultStyles contentEditable={false}>
        <ResultContent type={type} value={value[0]} />
      </SingleResultStyles>
    );
  } else {
    return null;
  }
};
