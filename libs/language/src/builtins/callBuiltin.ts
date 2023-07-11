import DeciNumber from '@decipad/number';
import { getOnly } from '@decipad/utils';
import { getOperatorByName } from './operators';
import { automapValues, automapValuesForReducer } from '../dimtools';

import { Unknown, UnknownValue, Value, defaultValue, fromJS } from '../value';
import { getDefined } from '../utils';
import { Realm, RuntimeError } from '../interpreter';
import { convertToMultiplierUnit, Type } from '../type';
import { autoconvertResult, autoconvertArguments } from '../units';
import { BuiltinSpec } from './interfaces';

async function shouldAutoconvert(types: Type[]): Promise<boolean> {
  // console.log(
  //   'shouldAutoconvert units',
  //   types.map((t) => [t.unit, t.cellType?.unit?.map((u) => u.unit)])
  // );
  if (types.length === 1) {
    return false;
  }
  if (types.length === 2) {
    const [typeA, typeB] = await Promise.all(
      types.map(async (t) => t.reducedToLowest())
    );
    // console.log({ typeA, typeB });
    if ((typeA.unit && !typeB.unit) || (typeB.unit && !typeA.unit)) {
      return false;
    }
  }
  return true;
}

async function callBuiltinAfterAutoconvert(
  realm: Realm,
  funcName: string,
  builtin: BuiltinSpec,
  args: Value[],
  argTypes: Type[]
): Promise<Value> {
  if (builtin.fnValuesNoAutomap) {
    return builtin.fnValuesNoAutomap(args, argTypes, realm);
  }

  const lowerDimFn = async (
    argsLowerDims: Value[],
    typesLowerDims: Type[]
  ): Promise<Value> => {
    if (builtin.fn != null) {
      const argData = await Promise.all(
        argsLowerDims.map(async (a) => a.getData())
      );
      if (argData.some((d) => d === Unknown)) {
        return UnknownValue;
      }
      try {
        return fromJS(builtin.fn(argData, typesLowerDims));
      } catch (err) {
        if (err instanceof RuntimeError) {
          throw err;
        }
        console.error('Error calling fromJS with ', argData, typesLowerDims);
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
    const onlyArgType = getOnly(
      argTypes,
      'panic: isReducer used in a function with multiple arguments'
    );
    const onlyArg = getOnly(
      args,
      'panic: isReducer used in a function with multiple arguments'
    );

    return automapValuesForReducer(onlyArgType, onlyArg, lowerDimFn);
  }

  return automapValues(
    realm.inferContext,
    argTypes,
    args,
    lowerDimFn,
    builtin.argCardinalities
  );
}

const stages = ['autoConvertArguments', 'builtin', 'autoConvertResult'];

export const callBuiltin = async (
  realm: Realm,
  funcName: string,
  argsBeforeConvert: Value[],
  argTypes: Type[],
  returnType: Type
): Promise<Value> => {
  const op = getDefined(
    getOperatorByName(funcName),
    `panic: builtin not found: ${funcName}`
  );

  let stage = 0;
  try {
    const autoConvert =
      !!op.autoConvertArgs ||
      (!op.noAutoconvert && (await shouldAutoconvert(argTypes)));
    let args = autoConvert
      ? await autoconvertArguments(realm, argsBeforeConvert, argTypes)
      : argsBeforeConvert;

    if (op.absoluteNumberInput && !returnType.unit) {
      args = await Promise.all(
        args.map(async (value, index) => {
          const type = argTypes[index];
          if (type.type === 'number') {
            const data = await value.getData();
            if (data instanceof DeciNumber) {
              return fromJS(
                convertToMultiplierUnit(data, type.unit),
                defaultValue('number')
              );
            }
          }
          return value;
        })
      );
    }

    stage += 1;
    const resultBeforeConvertingBack = await callBuiltinAfterAutoconvert(
      realm,
      funcName,
      op,
      args,
      argTypes
    );
    stage += 1;
    return autoConvert
      ? autoconvertResult(realm, resultBeforeConvertingBack, returnType)
      : resultBeforeConvertingBack;
  } catch (err) {
    if (
      process.env.NODE_ENV !== 'test' &&
      typeof jest === 'undefined' &&
      !(err instanceof RuntimeError)
    ) {
      console.error(`Error at stage ${stages[stage]}`, err);
    }
    throw new RuntimeError((err as Error)?.message || 'Unknown error');
  }
};
