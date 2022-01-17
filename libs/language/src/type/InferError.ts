import { Time, Type, Units } from '..';
import { stringifyUnits } from './units';

export type ErrSpec =
  | {
      errType: 'free-form';
      message: string;
    }
  | {
      errType: 'missing-variable';
      missingVariable: [name: string];
    }
  | {
      errType: 'expected-but-got';
      expectedButGot: [Type | string, Type | string];
    }
  | {
      errType: 'expected-arg-count';
      expectedArgCount: [string, number, number];
    }
  | {
      errType: 'expected-unit';
      expectedUnit: [Units | null, Units | null];
    }
  | {
      errType: 'expected-column-contained';
    }
  | { errType: 'unexpected-empty-column' }
  | { errType: 'unexpected-empty-table' }
  | {
      errType: 'mismatched-specificity';
      expectedSpecificity: Time.Specificity;
      gotSpecificity: Time.Specificity;
    }
  | {
      errType: 'column-contains-inconsistent-type';
      cellType: Type;
      got: Type;
    }
  | {
      errType: 'bad-overloaded-builtin-call';
      functionName: string;
      gotArgTypes: Type[];
    }
  | {
      errType: 'cannot-convert-between-units';
      fromUnit: Units;
      toUnit: Units;
    }
  | {
      errType: 'cannot-convert-to-unit';
      toUnit: Units;
    }
  | {
      errType: 'unknown-category';
      dimensionId: string | number;
    }
  | {
      errType: 'expected-table-and-associated-column';
      gotTable: Type;
      gotColumn: Type;
    };

// exhaustive switch
// eslint-disable-next-line consistent-return
function specToString(spec: ErrSpec): string {
  switch (spec.errType) {
    case 'free-form': {
      return spec.message;
    }
    case 'missing-variable': {
      const [name] = spec.missingVariable;
      return `The variable ${name} is missing`;
    }
    case 'expected-but-got': {
      const [expected, got] = spec.expectedButGot.map((t) =>
        typeof t === 'string' ? t : t.toBasicString()
      );

      return `This operation requires a ${expected} and a ${got} was entered`;
    }
    case 'expected-unit': {
      return 'This operation requires compatible units';
    }
    case 'expected-arg-count': {
      const [fname, expected, got] = spec.expectedArgCount;

      return `The function ${fname} requires ${expected} parameters and ${got} parameters were entered`;
    }
    case 'expected-column-contained': {
      return `expected column to belong to table`;
    }
    case 'unexpected-empty-column': {
      return `Unexpected empty column`;
    }
    case 'unexpected-empty-table': {
      return `Unexpected empty table`;
    }
    case 'mismatched-specificity': {
      const { expectedSpecificity, gotSpecificity } = spec;
      return `Expected time specific up to the ${expectedSpecificity}, but got ${gotSpecificity}`;
    }
    case 'column-contains-inconsistent-type': {
      const { cellType, got } = spec;
      return `Column cannot contain both ${cellType.toBasicString()} and ${got.toBasicString()}`;
    }
    case 'bad-overloaded-builtin-call': {
      const gotArgTypes = spec.gotArgTypes
        .map((argType) => argType.toBasicString())
        .join(', ');
      return `The function ${spec.functionName} cannot be called with (${gotArgTypes})`;
    }
    case 'cannot-convert-between-units': {
      return `Don't know how to convert between units ${stringifyUnits(
        spec.fromUnit
      )} and ${stringifyUnits(spec.toUnit)}`;
    }
    case 'cannot-convert-to-unit': {
      return `Cannot convert to unit ${stringifyUnits(spec.toUnit)}`;
    }
    case 'unknown-category': {
      return `Unknown category ${spec.dimensionId}`;
    }
    case 'expected-table-and-associated-column': {
      return `Expected table and associated column`;
    }
  }
}

export class InferError {
  spec: ErrSpec;

  constructor(spec: string | ErrSpec) {
    if (typeof spec === 'string') {
      this.spec = {
        errType: 'free-form',
        message: spec,
      };
    } else {
      this.spec = spec;
    }
  }

  static missingVariable(varName: string) {
    return new InferError({
      errType: 'missing-variable',
      missingVariable: [varName],
    });
  }

  static expectedButGot(
    expected: Type | string,
    got: Type | string
  ): InferError {
    return new InferError({
      errType: 'expected-but-got',
      expectedButGot: [expected, got],
    });
  }

  static expectedArgCount(
    fname: string,
    expected: number,
    got: number
  ): InferError {
    return new InferError({
      errType: 'expected-arg-count',
      expectedArgCount: [fname, expected, got],
    });
  }

  static expectedColumnContained() {
    return new InferError({
      errType: 'expected-column-contained',
    });
  }

  static expectedUnit(expected: Units | null, got: Units | null) {
    return new InferError({
      errType: 'expected-unit',
      expectedUnit: [expected, got],
    });
  }

  static unexpectedEmptyColumn() {
    return new InferError({
      errType: 'unexpected-empty-column',
    });
  }

  static unexpectedEmptyTable() {
    return new InferError({
      errType: 'unexpected-empty-table',
    });
  }

  static mismatchedSpecificity(
    expectedSpecificity: Time.Specificity,
    gotSpecificity: Time.Specificity
  ) {
    return new InferError({
      errType: 'mismatched-specificity',
      expectedSpecificity,
      gotSpecificity,
    });
  }

  static columnContainsInconsistentType(cellType: Type, got: Type) {
    return new InferError({
      errType: 'column-contains-inconsistent-type',
      cellType,
      got,
    });
  }

  static badOverloadedBuiltinCall(functionName: string, gotArgTypes: Type[]) {
    return new InferError({
      errType: 'bad-overloaded-builtin-call',
      functionName,
      gotArgTypes,
    });
  }

  static cannotConvertBetweenUnits(fromUnit: Units, toUnit: Units) {
    return new InferError({
      errType: 'cannot-convert-between-units',
      fromUnit,
      toUnit,
    });
  }

  static cannotConvertToUnit(toUnit: Units) {
    return new InferError({
      errType: 'cannot-convert-to-unit',
      toUnit,
    });
  }

  static unknownCategory(dimensionId: number | string) {
    return new InferError({
      errType: 'unknown-category',
      dimensionId,
    });
  }

  static expectedTableAndAssociatedColumn(gotTable: Type, gotColumn: Type) {
    return new InferError({
      errType: 'expected-table-and-associated-column',
      gotTable,
      gotColumn,
    });
  }

  get message() {
    return specToString(this.spec);
  }

  get url() {
    return `/docs/errors#${this.spec.errType}`;
  }
}
