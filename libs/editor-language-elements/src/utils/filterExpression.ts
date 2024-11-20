import { Filter } from '@decipad/editor-types';
import { type AST } from '@decipad/language-interfaces';
import { fromNumber } from '@decipad/number';
import { dateToAST } from 'libs/parse/src/utils/dateToAST';

const getLiteral = (filter: Filter): AST.Literal | AST.Date => {
  switch (filter.type) {
    case 'date': {
      return dateToAST(
        {
          kind: 'date',
          date: filter.value.specificity,
        },
        BigInt(filter.value.time)
      );
    }
    case 'number': {
      return {
        type: 'literal',
        args: ['number', fromNumber(filter.value)],
      };
    }
    case 'string': {
      return {
        type: 'literal',
        args: ['string', filter.value],
      };
    }
  }
};

const getComparisonArguments = (filter: Filter): AST.ArgList => {
  switch (filter.type) {
    case 'date':
    case 'number': {
      return {
        type: 'argument-list',
        args: [
          {
            type: 'externalref',
            args: [filter.columnId],
          },
          getLiteral(filter),
        ],
      };
    }
    case 'string': {
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
                args: [getLiteral(filter)],
              },
            ],
          },
        ],
      };
    }
  }
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
