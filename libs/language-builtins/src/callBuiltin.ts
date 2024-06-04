import DeciNumber from '@decipad/number';
import { getDefined, getOnly } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { ContextUtils, Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  Dimension,
  RuntimeError,
  Unit,
  Value,
  autoconvertArguments,
  autoconvertResult,
} from '@decipad/language-types';
import type { AST, Value as ValueTypes } from '@decipad/language-interfaces';
import { getOperatorByName } from './operators';
import {
  type FullBuiltinSpec,
  type BuiltinContextUtils,
  type CallBuiltin,
} from './types';

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

const createLowerDimFn =
  (builtin: FullBuiltinSpec, argNodes: AST.Expression[]) =>
  async (
    argsLowerDims: ValueTypes.Value[],
    typesLowerDims: Type[],
    context: ContextUtils
  ): Promise<ValueTypes.Value> => {
    if (
      !builtin.likesUnknowns &&
      argsLowerDims.some((d) => d === Value.UnknownValue)
    ) {
      return Value.UnknownValue;
    }
    if (builtin.fn != null) {
      const argData = await Promise.all(
        argsLowerDims.map(async (a) => a.getData())
      );
      return Value.fromJS(builtin.fn(argData, typesLowerDims));
    } else if (builtin.fnValues != null) {
      return builtin.fnValues(argsLowerDims, typesLowerDims, context, argNodes);
    } else {
      /* istanbul ignore next */
      throw new Error('unreachable');
    }
  };

async function callBuiltinAfterAutoconvert(
  context: BuiltinContextUtils,
  builtin: FullBuiltinSpec,
  args: ValueTypes.Value[],
  argTypes: Type[],
  argNodes: AST.Expression[]
): Promise<ValueTypes.Value> {
  if (builtin.fnValuesNoAutomap) {
    return builtin.fnValuesNoAutomap(args, argTypes, context, argNodes);
  }

  const lowerDimFn = createLowerDimFn(builtin, argNodes);

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

  const autoMappedResult = await Dimension.automapValues(
    context,
    argTypes,
    args,
    lowerDimFn,
    builtin.argCardinalities
  );

  return autoMappedResult;
}

const maybeFixArgs = async (
  args: ValueTypes.Value[],
  argTypes: Type[]
): Promise<ValueTypes.Value[]> => {
  return Promise.all(
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
};

const stages = ['autoConvertArguments', 'callBuiltin', 'autoConvertResult'];

// eslint-disable-next-line complexity
export const callBuiltin: CallBuiltin = async (
  ctx,
  funcName,
  argsBeforeConvert,
  argTypes,
  returnType,
  argNodes,
  _op: FullBuiltinSpec | undefined = getOperatorByName(funcName) ?? undefined
) => {
  const op = getDefined(_op, `panic: builtin not found: ${funcName}`);

  let stage = 0;
  try {
    const autoConvert =
      !!op.autoConvertArgs ||
      (!op.noAutoconvert && (await shouldAutoconvert(argTypes)));
    let args = autoConvert
      ? await autoconvertArguments(ctx, argsBeforeConvert, argTypes)
      : argsBeforeConvert;

    if (op.absoluteNumberInput && !returnType.unit) {
      args = await maybeFixArgs(args, argTypes);
    }

    stage += 1;
    const resultBeforeConvertingBack = await callBuiltinAfterAutoconvert(
      ctx,
      op,
      args,
      argTypes,
      argNodes
    );

    stage += 1;
    return autoConvert
      ? autoconvertResult(ctx, resultBeforeConvertingBack, returnType, funcName)
      : resultBeforeConvertingBack;
  } catch (err) {
    if (
      process.env.NODE_ENV !== 'test' &&
      typeof jest === 'undefined' &&
      !(err instanceof RuntimeError)
    ) {
      console.error(
        `callBuiltin "${funcName}": Error at stage ${stage} (${stages[stage]})`
      );
      console.error(err);
      console.error('arguments to callBuiltin:', {
        funcName,
        argsBeforeConvert,
        argTypes,
        returnType,
        argNodes,
        op,
      });
    }
    throw new RuntimeError((err as Error)?.message || 'Unknown error');
  }
};
