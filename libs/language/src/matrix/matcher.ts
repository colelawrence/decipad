import pSeries from 'p-series';
import { getOnly } from '@decipad/utils';
import { AST, Column, Context } from '..';
import { getCardinality } from '../dimtools/common';
import { inferExpression } from '../infer';
import { evaluate, Realm, Value } from '../interpreter';
import { compare } from '../interpreter/compare-values';
import { build as t, Type, InferError } from '../type';
import { getIdentifierString, getOfType } from '../utils';
import { FractionValue } from '../interpreter/Value';
import { evaluateVariable, getIndexName } from './getVariable';

/** Read inside the square brackets */
export const readSimpleMatchers = (matcher: AST.Expression) => {
  if (matcher.type === 'ref') {
    // VariableName[DimensionName]
    return [getIdentifierString(matcher), null] as const;
  } else {
    // VariableName[DimensionName == "Dimension item"]
    const [dimNameRef, needleExp] = getOfType('function-call', matcher).args[1]
      .args;
    const dimName = getIdentifierString(dimNameRef as AST.Def | AST.Ref);

    return [dimName, needleExp] as const;
  }
};

export const matchTargets = async (
  realm: Realm,
  matchers: AST.MatrixMatchers
): Promise<[number, boolean[]]> => {
  const matcher = getOnly(matchers.args);
  const [dimName, needleExp] = readSimpleMatchers(matcher);
  const dimension = evaluateVariable(realm, dimName);

  if (needleExp == null) {
    // VariableName[DimensionName]
    const { length } = (dimension as Column).values;
    return [length, Array.from({ length }, () => true)];
  } else {
    // VariableName[DimensionName == "Dimension item"]

    // We know these are comparable
    const compareScalars = (a: Value, b: Value) =>
      compare((a as FractionValue).getData(), (b as FractionValue).getData());

    let length = 0;
    const matches = await pSeries(
      dimension.values.map((dimItem) => async () => {
        const result =
          compareScalars(dimItem, await evaluate(realm, needleExp)) === 0;
        if (result) {
          length++;
        }
        return result;
      })
    );

    return [length, matches];
  }
};

export const inferMatchers = async (
  context: Context,
  matchers: AST.MatrixMatchers
): Promise<Type> => {
  const matcher = getOnly(matchers.args);
  const [dimName, needleExp] = readSimpleMatchers(matcher);

  const dimension = context.stack.get(dimName);

  if (!dimension) {
    return t.impossible(InferError.missingVariable(dimName));
  }

  if (getCardinality(dimension) !== 2 && !getIndexName(dimension)) {
    return t.impossible(InferError.expectedAssociatedColumn(dimension));
  }

  if (needleExp == null) {
    // VariableName[DimensionName]
    return dimension.reduced().isPrimitive();
  } else {
    // VariableName[DimensionName == "Needle"]
    return (await inferExpression(context, needleExp))
      .isPrimitive()
      .sameAs(dimension.reduced());
  }
};
