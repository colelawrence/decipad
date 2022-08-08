import Fraction, { pow } from '@decipad/fraction';

import produce from 'immer';
import { getDefined } from '@decipad/utils';
import { RuntimeError } from '../interpreter';
import { automapTypes, automapValues } from '../dimtools';
import { FractionValue, fromJS, Value } from '../interpreter/Value';
import { AST } from '../parser';
import { build as t, InferError, Type, Unit } from '../type';
import { matchUnitArrays } from '../type/units';
import { areUnitsConvertible, convertBetweenUnits, parseUnit } from '../units';
import type { GetTypeCtx, GetValueCtx, Directive } from './types';
import { F, getIdentifierString, getInstanceof, U } from '../utils';

function isUserUnit(exp: AST.Expression, targetUnit: Unit[]) {
  if (exp.type !== 'ref') {
    return false;
  }
  const unit: Unit[] = [parseUnit(getIdentifierString(exp))];
  return !matchUnitArrays(unit, targetUnit);
}

function multiplyUnitMultipliers(units: Unit[] | null | undefined): Fraction {
  return (units || []).reduce(
    (acc, unit) => acc.mul(pow(unit.multiplier, unit.exp)),
    F(1)
  );
}

function multiplyUnitMultipliersIfNeedsEnforcing(
  units: Unit[] | null | undefined
): Fraction {
  return (units || []).reduce(
    (acc, unit) =>
      unit.enforceMultiplier ? acc.mul(pow(unit.multiplier, unit.exp)) : acc,
    F(1)
  );
}

export async function getType(
  _: AST.Expression,
  { infer }: GetTypeCtx,
  [expr, unitExpr]: [AST.Expression, AST.Expression]
): Promise<Type> {
  const expressionType = await infer(expr);
  if (expressionType.errorCause) {
    return expressionType;
  }
  const unitExpressionType = (await infer(unitExpr)).isScalar('number');
  if (unitExpressionType.errorCause) {
    return unitExpressionType;
  }
  const { unit } = unitExpressionType.reducedToLowest();
  let targetUnit = unit;
  if (unitExpr.type === 'ref' && unit && isUserUnit(unitExpr, unit)) {
    targetUnit = U(getIdentifierString(unitExpr), {
      known: false,
      aliasFor: unit,
    });
  }
  const ret = automapTypes(
    [expressionType],
    ([expressionType]: Type[]): Type => {
      const sourceUnits = expressionType.unit;
      if (!sourceUnits || sourceUnits.length === 0) {
        return t.number(targetUnit);
      }

      if (unit && !areUnitsConvertible(sourceUnits, unit)) {
        return t.impossible(
          InferError.cannotConvertBetweenUnits(sourceUnits, unit)
        );
      }

      return t.number(targetUnit);
    }
  );
  return ret;
}

function inlineUnitAliases(units: Unit[] | null): Unit[] | null {
  if (!units) {
    return null;
  }
  return units.reduce<Unit[]>((units, oneUnit) => {
    if (oneUnit.aliasFor != null) {
      const unit = getDefined(inlineUnitAliases(oneUnit.aliasFor));
      for (const u of unit) {
        units.push(
          produce(u, (unit) => {
            unit.enforceMultiplier = true;
          })
        );
      }
    } else {
      units.push(oneUnit);
    }
    return units;
  }, []);
}

export async function getValue(
  root: AST.Expression,
  { evaluate, getNodeType }: GetValueCtx,
  [expression, unitsExpression]: [AST.Expression, AST.Expression]
): Promise<Value> {
  const evalResult = await evaluate(expression);
  const targetUnitsEvalResult = await evaluate(unitsExpression);
  const targetUnitsData = getInstanceof(
    targetUnitsEvalResult.getData(),
    Fraction,
    `units needs to be a number`
  );

  const returnExpressionType = await getNodeType(root);
  const returnTypeDivider = multiplyUnitMultipliersIfNeedsEnforcing(
    inlineUnitAliases(returnExpressionType.unit)
  );

  const expressionType = await getNodeType(expression);

  const sourceUnits = inlineUnitAliases(expressionType.reducedToLowest().unit);
  const targetUnitsExpressionType = await getNodeType(unitsExpression);
  const targetUnits = inlineUnitAliases(targetUnitsExpressionType.unit);

  const targetUnitsMultiplier = multiplyUnitMultipliers(targetUnits);
  const targetMultiplierConversionRate = targetUnitsData.div(
    targetUnitsMultiplier
  );

  const conversionRate = targetMultiplierConversionRate.mul(returnTypeDivider);

  return automapValues([expressionType], [evalResult], ([value]) => {
    if (value instanceof FractionValue) {
      if (!targetUnits || !sourceUnits || sourceUnits.length < 1) {
        return fromJS(value.getData().div(conversionRate));
      }

      const converted = convertBetweenUnits(
        value.getData(),
        sourceUnits,
        targetUnits
      );

      return fromJS(converted.div(conversionRate));
    }

    throw targetUnits
      ? InferError.cannotConvertToUnit(targetUnits)
      : new RuntimeError(
          `Don't know how to convert value to ${value.getData().toString()}`
        );
  });
}

export const as: Directive = {
  argCount: 2,
  getType,
  getValue,
};
