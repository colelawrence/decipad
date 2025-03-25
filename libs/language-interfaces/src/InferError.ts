import type { Unit } from './Unit';
import type * as Time from './Time';
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
  | {
      errType: 'unknown-table-column';
      tableName: string;
      columnName: string;
    }
);

export interface IInferError extends Error {
  spec: ErrSpec;
  pathToError: ('range' | 'column' | 'metric')[];
  url: string;
}
