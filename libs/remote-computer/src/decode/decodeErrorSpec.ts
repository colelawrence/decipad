import { ErrSpec, Type, Unit } from '@decipad/language-interfaces';
import { decodeUnit } from './decodeUnit';
import { SerializedUnit } from '../types/serializedTypes';

export const decodeErrorSpec =
  (decodeType: (type: Type) => Type) =>
  (errSpec: ErrSpec): ErrSpec => {
    switch (errSpec.errType) {
      case 'expected-but-got': {
        let [arg1, arg2] = errSpec.expectedButGot;
        if (typeof arg1 !== 'string') {
          arg1 = decodeType(arg1);
        }
        if (typeof arg2 !== 'string') {
          arg2 = decodeType(arg2);
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
            (expected as SerializedUnit[] | null)?.map(
              decodeUnit
            ) as Array<Unit> | null,
            (got as SerializedUnit[] | null)?.map(
              decodeUnit
            ) as Array<Unit> | null,
          ],
        };
      }
      case 'column-contains-inconsistent-type': {
        const { cellType, got } = errSpec;
        return {
          ...errSpec,
          cellType: decodeType(cellType),
          got: decodeType(got),
        };
      }
      case 'bad-overloaded-builtin-call': {
        const { gotArgTypes } = errSpec;
        return {
          ...errSpec,
          gotArgTypes: gotArgTypes.map(decodeType),
        };
      }
      case 'cannot-convert-between-units': {
        const { fromUnit, toUnit } = errSpec;
        return {
          ...errSpec,
          fromUnit: (fromUnit as unknown as SerializedUnit[]).map(decodeUnit),
          toUnit: (toUnit as unknown as SerializedUnit[]).map(decodeUnit),
        };
      }
      case 'cannot-convert-to-unit': {
        const { toUnit } = errSpec;
        return {
          ...errSpec,
          toUnit: (toUnit as unknown as SerializedUnit[]).map(decodeUnit),
        };
      }
      case 'expected-table-and-associated-column': {
        const { gotTable, gotColumn } = errSpec;
        return {
          ...errSpec,
          gotTable: gotTable ? decodeType(gotTable) : undefined,
          gotColumn: gotColumn ? decodeType(gotColumn) : undefined,
        };
      }
    }

    return errSpec;
  };
