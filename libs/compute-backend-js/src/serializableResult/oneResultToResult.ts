import DeciNumber from '@decipad/number';
import { Result, OneResult } from 'libs/language-interfaces/src/Result';
import { Tree } from 'libs/language-types/src/Value';

export const oneResultToResult = (oneResult: OneResult): Result => {
  if (oneResult instanceof DeciNumber) {
    return {
      type: { kind: 'number' },
      value: oneResult,
    };
  }
  if (typeof oneResult === 'string') {
    return {
      type: { kind: 'string' },
      value: oneResult,
    };
  }
  if (typeof oneResult === 'boolean') {
    return {
      type: { kind: 'boolean' },
      value: oneResult,
    };
  }
  if (oneResult instanceof Date || oneResult === undefined) {
    return {
      type: { kind: 'date', date: 'undefined' },
      value: oneResult,
    };
  }

  if (typeof oneResult === 'function') {
    return {
      type: {
        kind: 'column',
        indexedBy: 'number',
        cellType: { kind: 'anything' },
      },
      value: oneResult,
    };
  }

  // this could also be [DeciNumber, DeciNumber], but we ignore that case because it could also be a column or row
  if (
    Array.isArray(oneResult) &&
    oneResult.length === 2 &&
    typeof oneResult[0] === 'bigint' &&
    typeof oneResult[1] === 'bigint'
  ) {
    return {
      type: { kind: 'range', rangeOf: { kind: 'number' } },
      value: oneResult,
    };
  }
  // could also be a Range/Row/Table/MaterializedTable, but shouldn't really matter
  if (Array.isArray(oneResult)) {
    return {
      type: {
        kind: 'column',
        indexedBy: 'number',
        cellType: { kind: 'anything' },
      },
      value: oneResult,
    };
  }
  if (oneResult instanceof Tree) {
    return {
      type: {
        kind: 'tree',
        columnTypes: [],
        columnNames: [],
      },
      value: oneResult,
    };
  }
  if (typeof oneResult === 'symbol') {
    return {
      type: {
        kind: 'type-error',
        errorCause: { errType: 'free-form', message: '' },
      },
      value: oneResult,
    };
  }
  if (
    typeof oneResult === 'object' &&
    oneResult.hasOwnProperty('argumentNames') &&
    oneResult.hasOwnProperty('body')
  ) {
    return {
      type: {
        kind: 'function',
        name: '',
      },
      value: oneResult,
    };
  }
  throw new Error('Unknown result type');
};
