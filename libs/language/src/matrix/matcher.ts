import { getOnly } from '@decipad/utils';
import { all, map } from '@decipad/generator-utils';
// eslint-disable-next-line no-restricted-imports
import {
  AST,
  Dimension,
  InferError,
  Type,
  Value,
  compare,
  buildType as t,
} from '@decipad/language-types';
import { Context } from '..';
import { inferExpression, logRetrievedName } from '../infer';
import { evaluate, Realm } from '../interpreter';
import { getIdentifierString, getOfType } from '../utils';
import { evaluateVariable, getIndexName } from './getVariable';
import { generatorOfPromisesToGenerator } from '../../../generator-utils/src/generatorOfPromisesToGenerator';

/** Read inside the square brackets */
export const readSimpleMatchers = (ctx: Context, matcher: AST.Expression) => {
  if (matcher.type === 'ref') {
    const dimensionName = getIdentifierString(matcher);
    // VariableName[DimensionName]
    logRetrievedName(ctx, dimensionName);
    return [dimensionName, null] as const;
  } else {
    // VariableName[DimensionName == "Dimension item"]
    const [dimNameRef, needleExp] = getOfType('function-call', matcher).args[1]
      .args;
    const dimName = getIdentifierString(dimNameRef as AST.Def | AST.Ref);

    return [dimName, needleExp] as const;
  }
};

export const matchTargets = async (
  ctx: Context,
  realm: Realm,
  matchers: AST.MatrixMatchers
): Promise<[number, boolean[]]> => {
  const matcher = getOnly(matchers.args);
  const [dimName, needleExp] = readSimpleMatchers(ctx, matcher);
  const dimension = evaluateVariable(realm, dimName);

  if (needleExp == null) {
    // VariableName[DimensionName]
    const length = await dimension.rowCount();
    return [length, Array.from({ length }, () => true)];
  } else {
    // VariableName[DimensionName == "Dimension item"]

    // We know these are comparable
    const compareScalars = async (a: Value.Value, b: Value.Value) =>
      compare(
        await (a as Value.NumberValue).getData(),
        await (b as Value.NumberValue).getData()
      );

    let length = 0;
    const matcher = generatorOfPromisesToGenerator(
      map<Value.Value, Promise<boolean>>(
        dimension.values(),
        async (dimItem) => {
          const result =
            (await compareScalars(
              dimItem,
              await evaluate(realm, needleExp)
            )) === 0;
          if (result) {
            length++;
          }
          return result;
        }
      )
    );
    const matches = await all(matcher);

    return [length, matches];
  }
};

export const inferMatchers = async (
  realm: Realm,
  matchers: AST.MatrixMatchers
): Promise<Type> => {
  const { inferContext: ctx } = realm;
  const matcher = getOnly(matchers.args);
  const [dimName, needleExp] = readSimpleMatchers(ctx, matcher);

  logRetrievedName(ctx, dimName);
  const dimension = ctx.stack.get(dimName);

  if (!dimension) {
    return t.impossible(InferError.missingVariable(dimName));
  }

  if (Dimension.getCardinality(dimension) !== 2 && !getIndexName(dimension)) {
    return t.impossible(
      InferError.expectedTableAndAssociatedColumn(dimension, undefined)
    );
  }

  if (needleExp == null) {
    // VariableName[DimensionName]
    return (await dimension.reduced()).isPrimitive();
  } else {
    // VariableName[DimensionName == "Needle"]
    return (
      await (await inferExpression(realm, needleExp)).isPrimitive()
    ).sameAs(dimension.reduced());
  }
};
