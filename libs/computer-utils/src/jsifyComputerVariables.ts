/* eslint-disable @typescript-eslint/no-explicit-any */
import { Computer } from '@decipad/computer-interfaces';
import {
  Boolean as BooleanType,
  Number as NumberType,
  String as StringType,
  Date as DateType,
} from '@decipad/language-interfaces';
import DeciNumber, { safeNumberForPrecision } from '@decipad/number';
import { assert, assertInstanceOf } from '@decipad/utils';

type VarName = string;

export type ComputerVariable = {
  blockId: string;
} & (
  | { type: BooleanType; value: boolean }
  | { type: NumberType; value: number }
  | { type: StringType; value: string }
  | { type: DateType; value: Date }
);

export const getVariablesFromComputer = (
  computer: Computer
): Record<VarName, ComputerVariable> => {
  const notebookResults = computer.results$.get();
  const resultMap: Record<VarName, ComputerVariable> = {};

  for (const res of Object.values(notebookResults.blockResults)) {
    if (res.type === 'identified-error') {
      continue;
    }

    const varName = computer.getSymbolDefinedInBlock(res.id);
    if (varName == null) {
      continue;
    }

    const { result, id: blockId } = res;

    switch (result.type.kind) {
      case 'string':
        assert(typeof result.value === 'string');
        resultMap[varName] = {
          blockId,
          type: result.type,
          value: result.value,
        };
        break;
      case 'boolean': {
        assert(typeof result.value === 'boolean');
        resultMap[varName] = {
          blockId,
          type: result.type,
          value: result.value,
        };
        break;
      }
      case 'number': {
        assertInstanceOf(result.value, DeciNumber);
        const [, numberValue] = safeNumberForPrecision(result.value);
        resultMap[varName] = {
          blockId,
          type: result.type,
          value: numberValue,
        };
        break;
      }
      case 'date': {
        const date = new Date(Number(res.result.value));
        resultMap[varName] = { blockId, type: result.type, value: date };
      }
    }
  }

  return resultMap;
};
