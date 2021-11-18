import { AST, Time, Type } from '..';
import { OverloadTypeName } from '../builtins/overloadBuiltin';
import { stringifyUnits } from './units';

export type ErrSpec =
  | {
      errType: 'free-form';
      message: string;
    }
  | {
      errType: 'missingVariable';
      missingVariable: [name: string];
    }
  | {
      errType: 'expectedButGot';
      expectedButGot: [Type | string, Type | string];
    }
  | {
      errType: 'expectedArgCount';
      expectedArgCount: [string, number, number];
    }
  | {
      errType: 'expectedUnit';
      expectedUnit: [AST.Units | null, AST.Units | null];
    }
  | {
      errType: 'unexpectedEmptyColumn';
    }
  | {
      errType: 'mismatchedSpecificity';
      expectedSpecificity: Time.Specificity;
      gotSpecificity: Time.Specificity;
    }
  | {
      errType: 'columnContainsInconsistentType';
      cellType: Type;
      got: Type;
    }
  | {
      errType: 'badOverloadedBuiltinCall';
      functionName: string;
      gotArgTypes: OverloadTypeName[];
    }
  | {
      errType: 'cannotConvertBetweenUnits';
      fromUnit: AST.Units;
      toUnit: AST.Units;
    }
  | {
      errType: 'cannotConvertToUnit';
      toUnit: AST.Units;
    }
  | {
      errType: 'unknownCategory';
      dimensionId: string | number;
    };

// exhaustive switch
// eslint-disable-next-line consistent-return
function specToString(spec: ErrSpec): string {
  switch (spec.errType) {
    case 'free-form': {
      return spec.message;
    }
    case 'missingVariable': {
      const [name] = spec.missingVariable;
      return `The variable ${name} is missing`;
    }
    case 'expectedButGot': {
      const [expected, got] = spec.expectedButGot.map((t) =>
        typeof t === 'string' ? t : t.toBasicString()
      );

      return `This operation requires a ${expected} and a ${got} was entered`;
    }
    case 'expectedUnit': {
      return 'This operation requires matching units';
    }
    case 'expectedArgCount': {
      const [fname, expected, got] = spec.expectedArgCount;

      return `The function ${fname} requires ${expected} parameters and ${got} parameters were entered`;
    }
    case 'unexpectedEmptyColumn': {
      return `Unexpected empty column`;
    }
    case 'mismatchedSpecificity': {
      const { expectedSpecificity, gotSpecificity } = spec;
      return `Expected time specific up to the ${expectedSpecificity}, but got ${gotSpecificity}`;
    }
    case 'columnContainsInconsistentType': {
      const { cellType, got } = spec;
      return `Column cannot contain both ${cellType.toBasicString()} and ${got.toBasicString()}`;
    }
    case 'badOverloadedBuiltinCall': {
      const gotArgTypes = spec.gotArgTypes
        .map((argType) => argType.replace('-', ' '))
        .join(', ');
      return `The function ${spec.functionName} cannot be called with (${gotArgTypes})`;
    }
    case 'cannotConvertBetweenUnits': {
      return `Don't know how to convert between units ${stringifyUnits(
        spec.fromUnit
      )} and ${stringifyUnits(spec.toUnit)}`;
    }
    case 'cannotConvertToUnit': {
      return `Cannot convert to unit ${stringifyUnits(spec.toUnit)}`;
    }
    case 'unknownCategory': {
      return `Unknown category ${spec.dimensionId}`;
    }
  }
}

export class InferError {
  spec: ErrSpec;

  constructor(spec: string | ErrSpec) {
    if (typeof spec === 'string') {
      this.spec = { errType: 'free-form', message: spec };
    } else {
      this.spec = spec;
    }
  }

  static missingVariable(varName: string) {
    return new InferError({
      errType: 'missingVariable',
      missingVariable: [varName],
    });
  }

  static expectedButGot(
    expected: Type | string,
    got: Type | string
  ): InferError {
    return new InferError({
      errType: 'expectedButGot',
      expectedButGot: [expected, got],
    });
  }

  static expectedArgCount(
    fname: string,
    expected: number,
    got: number
  ): InferError {
    return new InferError({
      errType: 'expectedArgCount',
      expectedArgCount: [fname, expected, got],
    });
  }

  static expectedUnit(expected: AST.Units | null, got: AST.Units | null) {
    return new InferError({
      errType: 'expectedUnit',
      expectedUnit: [expected, got],
    });
  }

  static unexpectedEmptyColumn() {
    return new InferError({
      errType: 'unexpectedEmptyColumn',
    });
  }

  static mismatchedSpecificity(
    expectedSpecificity: Time.Specificity,
    gotSpecificity: Time.Specificity
  ) {
    return new InferError({
      errType: 'mismatchedSpecificity',
      expectedSpecificity,
      gotSpecificity,
    });
  }

  static columnContainsInconsistentType(cellType: Type, got: Type) {
    return new InferError({
      errType: 'columnContainsInconsistentType',
      cellType,
      got,
    });
  }

  static badOverloadedBuiltinCall(
    functionName: string,
    gotArgTypes: OverloadTypeName[]
  ) {
    return new InferError({
      errType: 'badOverloadedBuiltinCall',
      functionName,
      gotArgTypes,
    });
  }

  static cannotConvertBetweenUnits(fromUnit: AST.Units, toUnit: AST.Units) {
    return new InferError({
      errType: 'cannotConvertBetweenUnits',
      fromUnit,
      toUnit,
    });
  }

  static cannotConvertToUnit(toUnit: AST.Units) {
    return new InferError({
      errType: 'cannotConvertToUnit',
      toUnit,
    });
  }

  static unknownCategory(dimensionId: number | string) {
    return new InferError({
      errType: 'unknownCategory',
      dimensionId,
    });
  }

  get message() {
    return specToString(this.spec);
  }
}
