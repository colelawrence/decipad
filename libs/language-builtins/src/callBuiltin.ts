import DeciNumber from '@decipad/number';
import { getDefined, getOnly } from '@decipad/utils';
import { getOperatorByName } from './operators';
import { BuiltinSpec } from './interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  ContextUtils,
  Dimension,
  RuntimeError,
  Type,
  Unit,
  Unknown,
  Value,
  autoconvertArguments,
  autoconvertResult,
} from '@decipad/language-types';

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
  context: ContextUtils,
  funcName: string,
  builtin: BuiltinSpec,
  args: Value.Value[],
  argTypes: Type[]
): Promise<Value.Value> {
  if (builtin.fnValuesNoAutomap) {
    return builtin.fnValuesNoAutomap(args, argTypes, context);
  }

  const lowerDimFn = async (
    argsLowerDims: Value.Value[],
    typesLowerDims: Type[],
    context: ContextUtils
  ): Promise<Value.Value> => {
    if (builtin.fn != null) {
      const argData = await Promise.all(
        argsLowerDims.map(async (a) => a.getData())
      );
      if (argData.some((d) => d === Unknown) && !builtin.likesUnknowns) {
        return Value.UnknownValue;
      }
      try {
        return Value.fromJS(builtin.fn(argData, typesLowerDims));
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
      return builtin.fnValues(
        argsLowerDims as Value.Value[],
        typesLowerDims,
        context
      );
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

    return Dimension.automapValuesForReducer(
      onlyArgType,
      onlyArg,
      context,
      lowerDimFn
    );
  }

  return Dimension.automapValues(
    context,
    argTypes,
    args,
    lowerDimFn,
    builtin.argCardinalities
  );
}

const stages = ['autoConvertArguments', 'builtin', 'autoConvertResult'];

// eslint-disable-next-line complexity
export const callBuiltin = async (
  ctx: ContextUtils,
  funcName: string,
  argsBeforeConvert: Value.Value[],
  argTypes: Type[],
  returnType: Type
): Promise<Value.Value> => {
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
      ? await autoconvertArguments(ctx, argsBeforeConvert, argTypes)
      : argsBeforeConvert;

    if (op.absoluteNumberInput && !returnType.unit) {
      args = await Promise.all(
        args.map(async (value, index) => {
          const type = argTypes[index];
          if (type.type === 'number') {
            const data = await value.getData();
            if (data instanceof DeciNumber) {
              return Value.fromJS(
                Unit.convertToMultiplierUnit(data, type.unit),
                Value.defaultValue('number')
              );
            }
          }
          return value;
        })
      );
    }

    stage += 1;
    const resultBeforeConvertingBack = await callBuiltinAfterAutoconvert(
      ctx,
      funcName,
      op,
      args,
      argTypes
    );
    stage += 1;
    return autoConvert
      ? autoconvertResult(ctx, resultBeforeConvertingBack, returnType)
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
