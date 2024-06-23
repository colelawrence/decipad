import type { ErrSpec, Unit } from '@decipad/language-interfaces';
import { Type } from '@decipad/language-interfaces';
import { encodeUnit } from './encodeUnit';

export const encodeErrorSpec =
  (encodeType: (type: Type) => Type) =>
  (errSpec: ErrSpec): ErrSpec => {
    switch (errSpec.errType) {
      case 'expected-but-got': {
        let [arg1, arg2] = errSpec.expectedButGot;
        if (typeof arg1 !== 'string') {
          arg1 = encodeType(arg1);
        }
        if (typeof arg2 !== 'string') {
          arg2 = encodeType(arg2);
        }
        return {
          ...errSpec,
          expectedButGot: [arg1, arg2],
        };
      }
      case 'expected-unit': {
        const [expected, got] = errSpec.expectedUnit;
        return {
          ...errSpec,
          expectedUnit: [
            expected?.map(encodeUnit) as unknown as Array<Unit> | null,
            got?.map(encodeUnit) as unknown as Array<Unit> | null,
          ],
        };
      }
      case 'column-contains-inconsistent-type': {
        const { cellType, got } = errSpec;
        return {
          ...errSpec,
          cellType: encodeType(cellType),
          got: encodeType(got),
        };
      }
      case 'bad-overloaded-builtin-call': {
        const { gotArgTypes } = errSpec;
        return {
          ...errSpec,
          gotArgTypes: gotArgTypes.map(encodeType),
        };
      }
      case 'cannot-convert-between-units': {
        const { fromUnit, toUnit } = errSpec;
        return {
          ...errSpec,
          fromUnit: fromUnit.map(encodeUnit) as unknown as Unit[],
          toUnit: toUnit.map(encodeUnit) as unknown as Unit[],
        };
      }
      case 'cannot-convert-to-unit': {
        const { toUnit } = errSpec;
        return {
          ...errSpec,
          toUnit: toUnit.map(encodeUnit) as unknown as Unit[],
        };
      }
      case 'expected-table-and-associated-column': {
        const { gotTable, gotColumn } = errSpec;
        return {
          ...errSpec,
          gotTable: gotTable ? encodeType(gotTable) : undefined,
          gotColumn: gotColumn ? encodeType(gotColumn) : undefined,
        };
      }
    }

    return errSpec;
  };
