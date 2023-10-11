import { Result } from '@decipad/language';
import { Computer, ErrSpec, IdentifiedResult, Unit } from '..';

const translateIdentifier = (
  identifier: string,
  computer: Computer
): string => {
  return computer.latestExprRefToVarNameMap.get(identifier) ?? identifier;
};

const toUserlandError = (err: ErrSpec, computer: Computer): ErrSpec => {
  switch (err.errType) {
    case 'bad-overloaded-builtin-call': {
      err.functionName = translateIdentifier(err.functionName, computer);
      break;
    }
    case 'formula-cannot-call-itself': {
      err.fname = translateIdentifier(err.fname, computer);
      break;
    }
    case 'expected-arg-count': {
      err.expectedArgCount[0] = translateIdentifier(
        err.expectedArgCount[0],
        computer
      );
      break;
    }
    case 'unknown-table-column': {
      err.tableName = translateIdentifier(err.tableName, computer);
      err.columnName = translateIdentifier(err.columnName, computer);
      break;
    }
  }
  return err;
};

const toUserlandUnit = <T extends Unit[] | null | undefined>(
  units: T,
  computer: Computer
): T => {
  if (units == null) {
    return units;
  }
  units.forEach((unit) => {
    if (unit.quality) {
      unit.quality = translateIdentifier(unit.quality, computer);
    }
  }) as T;

  return units;
};

const toUserlandType = (
  type: Result.AnyResult['type'],
  computer: Computer
): Result.AnyResult['type'] => {
  if (type.kind === 'table' || type.kind === 'materialized-table') {
    type.columnTypes = type.columnTypes.map((colType) =>
      toUserlandType(colType, computer)
    );
  } else if (type.kind === 'column') {
    type.cellType = toUserlandType(type.cellType, computer);
  } else if (type.kind === 'number' && type.unit) {
    type.unit = type.unit && toUserlandUnit(type.unit, computer);
  } else if (type.kind === 'type-error') {
    type.errorCause = toUserlandError(type.errorCause, computer);
  }
  return type;
};

export const toUserlandResult = (
  result: IdentifiedResult,
  computer: Computer
): IdentifiedResult => {
  result.result.type = toUserlandType(result.result.type, computer);
  return result;
};
