// eslint-disable-next-line no-restricted-imports
import { immerable } from 'immer';
import stringify from 'json-stringify-safe';
import type { Unit, ErrSpec, IInferError } from '@decipad/language-interfaces';
import type * as Time from './Time';
import type { Type } from './Type';

// exhaustive switch
export class InferError extends Error implements IInferError {
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
    super(`Inference Error: ${spec.errType} : ${stringify(spec)}`);
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

  static unknownTableColumn(tableName: string, columnName: string) {
    return new InferError({
      errType: 'unknown-table-column',
      tableName,
      columnName,
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
      return `/docs`;
    }
    return `/docs`;
  }
}
