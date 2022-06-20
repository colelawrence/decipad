import FFraction from '@decipad/fraction';
import { getOperatorByName } from './operators';
import { automapValues, automapValuesForReducer } from '../dimtools';

import { Value, fromJS } from '../interpreter/Value';
import { getDefined } from '../utils';
import { Realm, RuntimeError } from '../interpreter';
import { convertToMultiplierUnit, Type } from '../type';
import { autoconvertResult, autoconvertArguments } from '../units';
import { BuiltinSpec } from './interfaces';

function shouldAutoconvert(types: Type[]): boolean {
  if (types.length === 1) {
    return false;
  }
  if (types.length === 2) {
    const [typeA, typeB] = types.map((t) => t.reducedToLowest());
    if ((typeA.unit && !typeB.unit) || (typeB.unit && !typeA.unit)) {
      return false;
    }
  }
  return true;
}

function callBuiltinAfterAutoconvert(
  realm: Realm,
  funcName: string,
  builtin: BuiltinSpec,
  args: Value[],
  argTypes: Type[]
): Value {
  if (builtin.fnValuesNoAutomap) {
    return builtin.fnValuesNoAutomap(args, argTypes, realm);
  }

  const lowerDimFn = (argsLowerDims: Value[], typesLowerDims: Type[]) => {
    if (builtin.fn != null) {
      const argData = argsLowerDims.map((a) => getDefined(a.getData()));
      try {
        return fromJS(builtin.fn(argData, typesLowerDims));
      } catch (err) {
        if (err instanceof RuntimeError) {
          throw err;
        }
        console.error(err);
        throw new TypeError(
          `Error calling builtin ${funcName}: ${(err as Error).message}`
        );
      }
    } else if (builtin.fnValues != null) {
      return builtin.fnValues(argsLowerDims as Value[], typesLowerDims, realm);
    } else {
      /* istanbul ignore next */
      throw new Error('unreachable');
    }
  };

  if (builtin.isReducer) {
    return automapValuesForReducer(argTypes[0], args[0], lowerDimFn);
  }

  return automapValues(argTypes, args, lowerDimFn, builtin.argCardinalities);
}

const stages = ['autoConvertArguments', 'builtin', 'autoConvertResult'];

export function callBuiltin(
  realm: Realm,
  funcName: string,
  argsBeforeConvert: Value[],
  argTypes: Type[],
  returnType: Type
): Value {
  const op = getDefined(
    getOperatorByName(funcName),
    `panic: builtin not found: ${funcName}`
  );

  if (op.aliasFor) {
    return callBuiltin(
      realm,
      op.aliasFor,
      argsBeforeConvert,
      argTypes,
      returnType
    );
  }

  let stage = 0;
  try {
    const autoConvert =
      !!op.autoConvertArgs ||
      (!op.noAutoconvert && shouldAutoconvert(argTypes));
    let args = autoConvert
      ? autoconvertArguments(argsBeforeConvert, argTypes)
      : argsBeforeConvert;

    if (op.absoluteNumberInput && !returnType.unit) {
      args = args.map((value, index) => {
        const type = argTypes[index];
        if (type.type === 'number') {
          const data = value.getData();
          if (data instanceof FFraction) {
            return fromJS(convertToMultiplierUnit(data, type.unit));
          }
        }
        return value;
      });
    }

    stage += 1;
    const resultBeforeConvertingBack = callBuiltinAfterAutoconvert(
      realm,
      funcName,
      op,
      args,
      argTypes
    );
    stage += 1;
    return autoConvert
      ? autoconvertResult(resultBeforeConvertingBack, returnType)
      : resultBeforeConvertingBack;
  } catch (err) {
    console.error(`Error at stage ${stages[stage]}`, err);
    throw new RuntimeError((err as Error)?.message || 'Unknown error');
  }
}
