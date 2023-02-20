import { ErrSpec, serializeType } from '@decipad/language';
import { formatTypeToBasicString } from './formatTypeBasic';
import { formatUnit } from './formatUnit';

// istanbul ignore next
export const formatError = (locale: string, spec: ErrSpec): string => {
  switch (spec.errType) {
    case 'free-form': {
      return spec.message;
    }
    case 'missing-variable': {
      const [name] = spec.missingVariable;
      return `The variable ${name} is missing`;
    }
    case 'missing-formula': {
      return `The formula ${spec.formulaName}() does not exist`;
    }
    case 'expected-but-got': {
      const [expected, got] = spec.expectedButGot.map((t) =>
        typeof t === 'string'
          ? t
          : formatTypeToBasicString(locale, serializeType(t))
      );

      return `This operation requires a ${expected} and a ${got} was entered`;
    }
    case 'expected-primitive': {
      const got = formatTypeToBasicString(locale, serializeType(spec.butGot));

      return `This operation requires a primitive value (string, number, boolean or date) and a ${got} was entered`;
    }
    case 'expected-unit': {
      return 'This operation requires compatible units';
    }
    case 'expected-arg-count': {
      const [fname, expected, got] = spec.expectedArgCount;

      return `The function ${fname} requires ${expected} parameters and ${got} parameters were entered`;
    }
    case 'unexpected-empty-column': {
      return `Unexpected empty column`;
    }
    case 'forbidden-inside-function': {
      const opType = { table: 'Table', category: 'Category' }[
        spec.forbiddenThing
      ];
      return `${opType} operations are forbidden inside functions`;
    }
    case 'mismatched-specificity': {
      const { expectedSpecificity, gotSpecificity } = spec;
      return `Expected time specific up to the ${expectedSpecificity}, but got ${gotSpecificity}`;
    }
    case 'column-contains-inconsistent-type': {
      const { cellType, got } = spec;
      return `Column cannot contain both ${formatTypeToBasicString(
        locale,
        serializeType(cellType)
      )} and ${formatTypeToBasicString(locale, serializeType(got))}`;
    }
    case 'bad-overloaded-builtin-call': {
      const gotArgTypes = spec.gotArgTypes
        .map((argType) =>
          formatTypeToBasicString(locale, serializeType(argType))
        )
        .join(', ');
      return `The function ${spec.functionName} cannot be called with (${gotArgTypes})`;
    }
    case 'cannot-convert-between-units': {
      return `Don't know how to convert between units ${formatUnit(
        locale,
        spec.fromUnit
      )} and ${formatUnit(locale, spec.toUnit)}`;
    }
    case 'formula-cannot-call-itself': {
      return `${spec.fname}() cannot be used in its own definition`;
    }
    case 'cannot-convert-to-unit': {
      return `Cannot convert to unit ${formatUnit(locale, spec.toUnit)}`;
    }
    case 'unknown-category': {
      return `Unknown category ${spec.dimensionId}`;
    }
    case 'duplicated-table-column': {
      return `The column ${spec.columnName} already exists in this table`;
    }
    case 'expected-table-and-associated-column': {
      return `Expected table and associated column`;
    }
    case 'duplicated-name': {
      return `This name is already being used. You cannot have duplicated names`;
    }
    case 'complex-expression-exponent': {
      return `Complex expressions not supported in exponents`;
    }
    case 'sequence-step-zero': {
      return `Sequence step must not be zero`;
    }
    case 'invalid-sequence-step': {
      const dir = spec.start < spec.end ? 'ascending' : 'descending';
      const stepSignal = Math.sign(spec.by) > 0 ? 'positive' : 'negative';
      return `Invalid step in sequence: sequence is ${dir} but step is ${stepSignal}`;
    }
    case 'no-previous-statement': {
      return 'No previous statement';
    }
    case 'need-one-only-one-unit': {
      return 'Need one and only one unit';
    }
    case 'unknown-reference': {
      return 'Unknown reference';
    }
    case 'retired-feature': {
      return "You're using a feature that's been retired";
    }
  }
};
