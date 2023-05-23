import DeciNumber, { N } from '@decipad/number';
import { produce, getDefined } from '@decipad/utils';
import { evaluate, RuntimeError } from '../interpreter';
import { automapTypes, automapValues } from '../dimtools';
import { NumberValue, fromJS, Value } from '../value';
import { AST } from '../parser';
import {
  buildType as t,
  convertToMultiplierUnit,
  InferError,
  Type,
  Unit,
} from '../type';
import { matchUnitArrays } from '../type/units';
import { areUnitsConvertible, convertBetweenUnits, parseUnit } from '../units';
import type { DirectiveImpl } from './types';
import { getIdentifierString, getInstanceof, U } from '../utils';
import { inferExpression } from '../infer';

function isUserUnit(exp: AST.Expression, targetUnit: Unit[]) {
  if (exp.type !== 'ref') {
    return false;
  }
  const unit: Unit[] = [parseUnit(getIdentifierString(exp))];
  return !matchUnitArrays(unit, targetUnit);
}

function multiplyUnitMultipliers(units: Unit[] | null | undefined): DeciNumber {
  return (units || []).reduce(
    (acc, unit) => acc.mul(unit.multiplier.pow(unit.exp)),
    N(1)
  );
}

function multiplyUnitMultipliersIfNeedsEnforcing(
  units: Unit[] | null | undefined
): DeciNumber {
  return (units || []).reduce(
    (acc, unit) =>
      unit.enforceMultiplier ? acc.mul(unit.multiplier.pow(unit.exp)) : acc,
    N(1)
  );
}

export const getType: DirectiveImpl<AST.AsDirective>['getType'] = async (
  ctx,
  { args: [, expr, unitExpr] }
): Promise<Type> => {
  const expressionType = await inferExpression(ctx, expr);
  if (expressionType.errorCause) {
    return expressionType;
  }

  if (representsPercentage(unitExpr)) {
    return automapTypes([await expressionType.isScalar('number')], (): Type => {
      return t.number(null, 'percentage');
    });
  }

  const unitExpressionType = await (
    await inferExpression(ctx, unitExpr)
  ).isScalar('number');
  if (unitExpressionType.errorCause) {
    return unitExpressionType;
  }
  const { unit } = await unitExpressionType.reducedToLowest();
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
        if (
          areUnitsConvertible(sourceUnits, unit, { tolerateImprecision: true })
        ) {
          // Only imprecision available today
          return t.number(targetUnit, undefined, 'month-day-conversion');
        }
        return t.impossible(
          InferError.cannotConvertBetweenUnits(sourceUnits, unit)
        );
      }

      return t.number(targetUnit);
    }
  );
  return ret;
};

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

export const getValue: DirectiveImpl<AST.AsDirective>['getValue'] = async (
  realm,
  root
): Promise<Value> => {
  const [, expression, unitsExpression] = root.args;
  const expressionType = realm.getTypeAt(expression);
  const expressionValue = await evaluate(realm, expression);
  const sourceUnits = inlineUnitAliases(
    (await expressionType.reducedToLowest()).unit
  );

  if (representsPercentage(unitsExpression)) {
    return automapValues(
      [expressionType],
      [expressionValue],
      ([value], [type]) => {
        const noMultiplier = convertToMultiplierUnit(
          getInstanceof(value, NumberValue).value,
          type.unit
        );
        return NumberValue.fromValue(noMultiplier);
      }
    );
  }

  const targetUnitsEvalResult = await evaluate(realm, unitsExpression);
  const targetUnitsData = getInstanceof(
    await targetUnitsEvalResult.getData(),
    DeciNumber,
    `units needs to be a number:`
  );

  const returnExpressionType = realm.getTypeAt(root);
  const returnTypeDivider = multiplyUnitMultipliersIfNeedsEnforcing(
    inlineUnitAliases(returnExpressionType.unit)
  );

  const targetUnitsExpressionType = realm.getTypeAt(unitsExpression);
  const targetUnits = inlineUnitAliases(targetUnitsExpressionType.unit);

  const targetUnitsMultiplier = multiplyUnitMultipliers(targetUnits);
  const targetMultiplierConversionRate = targetUnitsData.div(
    targetUnitsMultiplier
  );

  const conversionRate = targetMultiplierConversionRate.mul(returnTypeDivider);

  return automapValues([expressionType], [expressionValue], async ([value]) => {
    if (value instanceof NumberValue) {
      if (!targetUnits || !sourceUnits || sourceUnits.length < 1) {
        return fromJS((await value.getData()).div(conversionRate));
      }

      const converted = convertBetweenUnits(
        await value.getData(),
        sourceUnits,
        targetUnits,
        { tolerateImprecision: true }
      );

      return fromJS(converted.div(conversionRate));
    }

    throw targetUnits
      ? InferError.cannotConvertToUnit(targetUnits)
      : new RuntimeError(
          `Don't know how to convert value to ${value?.getData()?.toString()}`
        );
  });
};

export const as: DirectiveImpl<AST.AsDirective> = {
  getType,
  getValue,
};

function representsPercentage(
  unitExpr: AST.Expression | AST.GenericIdentifier
): unitExpr is AST.GenericIdentifier {
  // Parser only uses "generic-identifier" to represent percentage here
  return unitExpr.type === 'generic-identifier';
}
