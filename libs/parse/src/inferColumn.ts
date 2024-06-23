/* eslint-disable no-await-in-loop */
import type { Computer } from '@decipad/computer-interfaces';
import type { SerializedTypes } from '@decipad/language-interfaces';
import { areUnitsConvertible } from '@decipad/remote-computer';
import type { CellValueType } from '@decipad/editor-types';
import { containsNumber } from '@decipad/utils';
import { inferType } from '.';
import { highestTimeSpecificity } from './parseDate';
import type { SpreadsheetColumn } from './types';

interface InferColumnOptions {
  userType?: CellValueType;
  doNotTryExpressionNumbersParse?: boolean;
  doNotInferBoolean?: boolean;
}

const INFER_MAX_ROWS = 20;

export const inferColumn = async (
  computer: Computer,
  column: SpreadsheetColumn,
  options: InferColumnOptions = {}
): Promise<CellValueType> => {
  let lastType: CellValueType | undefined = options.userType;

  if (lastType && lastType?.kind !== 'anything') {
    return lastType;
  }

  const coalesce = (_newType: CellValueType) => {
    const newType =
      _newType.kind === 'type-error'
        ? ({ kind: 'string' } as SerializedTypes.String)
        : _newType;
    if (newType.kind === 'anything' || newType.kind === 'nothing') {
      return;
    }
    if (
      !lastType ||
      lastType.kind === 'anything' ||
      lastType.kind === 'nothing'
    ) {
      lastType = newType;
    } else if (newType.kind !== lastType.kind) {
      // inconsistent column type: default to string
      lastType = { kind: 'string' };
    } else if (newType.kind === 'date') {
      const lastDateType = lastType as SerializedTypes.Date;
      if (newType.date !== lastDateType.date) {
        const newGranularity = highestTimeSpecificity(
          lastDateType.date,
          newType.date
        );
        if (newGranularity) {
          lastType = {
            kind: 'date',
            date: newGranularity,
          };
        }
      }
    } else if (newType.kind === 'number') {
      if (lastType.kind !== 'number') {
        lastType = {
          kind: 'string',
        };
      } else if (!lastType.unit && newType.unit) {
        lastType = newType;
      } else if (
        newType.unit &&
        lastType.unit &&
        !areUnitsConvertible(newType.unit, lastType.unit)
      ) {
        lastType = { kind: 'string' };
      }
    }
  };

  for (const value of column.slice(0, INFER_MAX_ROWS)) {
    switch (typeof value) {
      case 'boolean':
        coalesce({ kind: 'string' });
        break;
      case 'number':
        if (typeof value === 'string' && !containsNumber(value)) {
          coalesce({ kind: 'string' });
        } else {
          coalesce({ kind: 'number', unit: null });
        }
        break;
      case 'string': {
        const inferredType = await inferType(computer, value, options);

        if (inferredType.type.kind === 'boolean' && options.doNotInferBoolean) {
          coalesce({ kind: 'string' });
        } else {
          coalesce(inferredType.type);
        }

        if (inferredType.type.kind === 'string') {
          continue;
        }
        break;
      }
      case 'undefined':
      case 'object': // null
        if (value == null) {
          coalesce({ kind: 'nothing' });
        }
        break;
      default:
        throw new Error(`Unexpected type of value: ${typeof value}`);
    }
  }

  return lastType ?? { kind: 'string' };
};
