import { type AST } from '@decipad/language-interfaces';
import {
  type DeciNumberInput,
  fromNumber,
  isDeciNumberInput,
} from '@decipad/number';

interface Filter {
  columnId: string;
  value: string | number | DeciNumberInput;
}

const getLiteral = (value: string | DeciNumberInput): AST.Literal => {
  if (typeof value === 'string') {
    return {
      type: 'literal',
      args: ['string', value],
    };
  }

  if (isDeciNumberInput(value)) {
    return {
      type: 'literal',
      args: ['number', fromNumber(value)],
    };
  }
  throw new Error(
    `Could not get literal for value of type ${typeof value}: ${String(value)}`
  );
};

const getComparisonArguments = (filter: Filter): AST.ArgList => {
  if (isDeciNumberInput(filter.value)) {
    return {
      type: 'argument-list',
      args: [
        {
          type: 'externalref',
          args: [filter.columnId],
        },
        getLiteral(filter.value),
      ],
    };
  }
  if (typeof filter.value === 'string') {
    return {
      type: 'argument-list',
      args: [
        {
          type: 'function-call',
          args: [
            {
              type: 'funcref',
              args: ['lowercase'],
            },
            {
              type: 'argument-list',
              args: [
                {
                  type: 'externalref',
                  args: [filter.columnId],
                },
              ],
            },
          ],
        },
        {
          type: 'function-call',
          args: [
            {
              type: 'funcref',
              args: ['lowercase'],
            },
            {
              type: 'argument-list',
              args: [getLiteral(filter.value)],
            },
          ],
        },
      ],
    };
  }

  throw new Error(
    `Could not get comparison arguments for filter value of type ${typeof filter}`
  );
};

export const filterExpression = (
  filters: Filter[]
): AST.Expression | undefined => {
  if (!filters.length) {
    return undefined;
  }
  const filterExpressions = filters.map((filter): AST.Expression => {
    return {
      type: 'function-call',
      args: [
        {
          type: 'funcref',
          args: ['=='],
        },
        getComparisonArguments(filter),
      ],
    };
  });

  return filterExpressions.reduce((exp, filter): AST.Expression => {
    return {
      type: 'function-call',
      args: [
        {
          type: 'funcref',
          args: ['and'],
        },
        {
          type: 'argument-list',
          args: [exp, filter],
        },
      ],
    };
  });
};
