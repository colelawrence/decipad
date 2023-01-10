import DeciNumber from '@decipad/number';
import { lenientZip, zip } from '@decipad/utils';
import { Type } from '..';
import { getSpecificity } from '../date';
import { Interpreter } from '../interpreter';
import { Unknown } from '../value';
import { SerializedType, SerializedTypeKind, serializeType } from '../type';

function validate(
  type: SerializedType,
  value: Interpreter.OneResult | null | undefined
): boolean {
  const getTrue = (cond: boolean, failureMessage: string) => {
    if (cond) return true;
    reportError(type, value);
    throw new Error(failureMessage);
  };
  const getArray = <T>(thing: T) => {
    if (Array.isArray(thing)) return thing;
    reportError(type, value);
    throw new Error('panic: expected array');
  };
  const getOfKind = (type: SerializedType, ...kinds: SerializedTypeKind[]) => {
    if (kinds.includes(type.kind)) return type;
    reportError(type, value);
    throw new Error(`panic: wanted ${kinds.join('/')} and got ${type.kind}`);
  };

  switch (type.kind) {
    case 'number': {
      return getTrue(value instanceof DeciNumber, 'panic: expected fraction');
    }
    case 'boolean':
    case 'string': {
      return getTrue(
        typeof value === type.kind,
        `panic: expected ${type.kind}`
      );
    }
    case 'date': {
      return (
        getTrue(
          getSpecificity(type.date) === type.date,
          `invalid date specificity ${type.date}`
        ) &&
        getTrue(
          typeof value === 'bigint' || value instanceof DeciNumber,
          'expected date to be represented as a bigint'
        )
      );
    }
    case 'range': {
      const values = getArray(value as Interpreter.ResultRange);

      getTrue(
        values.length === 2,
        'panic: expected range to be represented by an array of 2'
      );

      const rangeType = getOfKind(type.rangeOf, 'date', 'number');

      return validate(rangeType, values[0]) && validate(rangeType, values[1]);
    }
    case 'column': {
      const array = getArray(value as Interpreter.ResultColumn);
      return array.every((cell) => validate(type.cellType, cell));
    }
    case 'table': {
      return lenientZip(
        type.columnTypes,
        getArray(value as Interpreter.ResultTable)
      ).every(([cellType, value]) => {
        if (cellType) {
          const implicitColumn: SerializedType = {
            kind: 'column',
            cellType,
            columnSize: 'unknown',
            indexedBy: null,
          };
          validate(implicitColumn, value);
        }
      });
    }
    case 'row': {
      return zip(
        type.rowCellTypes,
        getArray(value as Interpreter.ResultRow)
      ).every(([type, value]) => validate(type, value));
    }
    case 'nothing': {
      return getTrue(value == null || value === Unknown, 'expected no value');
    }
    case 'function': {
      return getTrue(value == null || value === Unknown, 'expected no value');
    }
  }
  return true;
}

const reportError = (
  type: SerializedType,
  value: Interpreter.OneResult | null | undefined
) => {
  console.error('Failed to validate a Result:');
  console.error({ type, value });
};

export function validateResult(
  type: Type | SerializedType,
  value: Interpreter.OneResult | null | undefined
) {
  if (type instanceof Type) {
    type = serializeType(type);
  }

  try {
    return validate(type, value);
  } catch (e) {
    reportError(type, value);
    throw e;
  }
}
