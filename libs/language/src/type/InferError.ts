// eslint-disable-next-line no-restricted-imports
import { immerable } from 'immer';
import type { Time, Unit } from '..';
import type { Type } from './Type';

export type ErrSpec = {
  context?: string;
} & (
  | {
      errType: 'free-form';
      message: string;
    }
  | {
      errType: 'missing-variable';
      missingVariable: [name: string];
    }
  | {
      errType: 'missing-formula';
      formulaName: string;
    }
  | {
      errType: 'expected-but-got';
      expectedButGot: [Type | string, Type | string];
    }
  | {
      errType: 'expected-primitive';
      butGot: Type;
    }
  | {
      errType: 'expected-arg-count';
      expectedArgCount: [string, number, number];
    }
  | {
      errType: 'expected-unit';
      expectedUnit: [Unit[] | null, Unit[] | null];
    }
  | { errType: 'unexpected-empty-column' }
  | {
      errType: 'forbidden-inside-function';
      forbiddenThing: 'table' | 'category';
    }
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
      fromUnit: Unit[];
      toUnit: Unit[];
    }
  | {
      errType: 'formula-cannot-call-itself';
      fname: string;
    }
  | {
      errType: 'cannot-convert-to-unit';
      toUnit: Unit[];
    }
  | {
      errType: 'unknown-category';
      dimensionId: string | number;
    }
  | {
      errType: 'duplicated-table-column';
      columnName: string;
    }
  | {
      errType: 'expected-table-and-associated-column';
      gotTable?: Type;
      gotColumn?: Type;
    }
  | {
      errType: 'duplicated-name';
      duplicatedName: string;
    }
  | {
      errType: 'complex-expression-exponent';
    }
  | {
      errType: 'sequence-step-zero';
    }
  | {
      errType: 'invalid-sequence-step';
      start: number;
      end: number;
      by: number;
    }
  | {
      errType: 'no-previous-statement';
    }
  | {
      errType: 'need-one-only-one-unit';
    }
  | {
      errType: 'unknown-reference';
      refName: string;
    }
  | {
      errType: 'retired-feature';
      featureName: string;
    }
);

// exhaustive switch
export class InferError extends Error {
  [immerable] = true;

  spec: ErrSpec;
  pathToError: ('range' | 'column')[] = [];

  constructor(spec: string | ErrSpec) {
    if (typeof spec === 'string') {
      spec = {
        errType: 'free-form',
        message: spec,
      };
    }
    super(`Inference Error: ${spec.errType}`);
    this.spec = spec;
  }

  static missingVariable(varName: string) {
    return new InferError({
      errType: 'missing-variable',
      missingVariable: [varName],
    });
  }

  static missingFormula(formulaName: string) {
    return new InferError({
      errType: 'missing-formula',
      formulaName,
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

  static expectedPrimitive(butGot: Type): InferError {
    return new InferError({ errType: 'expected-primitive', butGot });
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

  static expectedUnit(expected: Unit[] | null, got: Unit[] | null) {
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

  static forbiddenInsideFunction(forbiddenThing: 'table' | 'category') {
    return new InferError({
      errType: 'forbidden-inside-function',
      forbiddenThing,
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

  static cannotConvertBetweenUnits(fromUnit: Unit[], toUnit: Unit[]) {
    return new InferError({
      errType: 'cannot-convert-between-units',
      fromUnit,
      toUnit,
    });
  }

  static formulaCannotCallItself(fname: string): string | InferError {
    return new InferError({ errType: 'formula-cannot-call-itself', fname });
  }

  static cannotConvertToUnit(toUnit: Unit[]) {
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

  static duplicateTableColumn(columnName: string) {
    return new InferError({
      errType: 'duplicated-table-column',
      columnName,
    });
  }

  static expectedTableAndAssociatedColumn(
    gotTable?: Type | null,
    gotColumn?: Type | null
  ) {
    return new InferError({
      errType: 'expected-table-and-associated-column',
      gotTable: gotTable ?? undefined,
      gotColumn: gotColumn ?? undefined,
    });
  }

  static duplicatedName(duplicatedName: string) {
    return new InferError({
      errType: 'duplicated-name',
      duplicatedName,
    });
  }

  static complexExpressionExponent() {
    return new InferError({
      errType: 'complex-expression-exponent',
    });
  }

  static sequenceStepZero() {
    return new InferError({
      errType: 'sequence-step-zero',
    });
  }

  static invalidSequenceStep(start: number, end: number, by: number) {
    return new InferError({
      errType: 'invalid-sequence-step',
      start,
      end,
      by,
    });
  }

  static noPreviousStatement() {
    return new InferError({
      errType: 'no-previous-statement',
    });
  }

  static needOneAndOnlyOneUnit() {
    return new InferError({
      errType: 'need-one-only-one-unit',
    });
  }

  static retiredFeature(featureName: string) {
    return new InferError({
      errType: 'retired-feature',
      featureName,
    });
  }

  get url() {
    if (this.spec.errType === 'retired-feature') {
      return `/docs/basic-concepts/retired-features#${this.spec.featureName}`;
    }
    return `/docs/basic-concepts/language-errors#${this.spec.errType}`;
  }
}
