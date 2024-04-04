import DeciNumber, { N, ONE } from '@decipad/number';
import { produce, getDefined, getInstanceof } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { AST, Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  Dimension,
  InferError,
  RuntimeError,
  Unit,
  Value,
  areUnitsConvertible,
  convertBetweenUnits,
  parseUnit,
  buildType as t,
} from '@decipad/language-types';
import { evaluate } from '../interpreter';
import type { DirectiveImpl } from './types';
import { getIdentifierString, U } from '../utils';
import { inferExpression } from '../infer';
import {
  isTypeCoercionTarget,
  coerceType,
  coerceValue,
} from '../type-coercion';

function isUserUnit(exp: AST.Expression, targetUnit: Unit.Unit[]) {
  if (exp.type !== 'ref') {
    return false;
  }
  const unit: Unit.Unit[] = [parseUnit(getIdentifierString(exp))];
  return !Unit.matchUnitArrays(unit, targetUnit);
}

function singleUnitRef(unit?: Unit.Unit): string | undefined {
  if (!unit || !unit.exp.equals(ONE) || !unit.multiplier.equals(ONE)) {
    return undefined;
  }
  return unit.unit;
}

function isTypeCoercion(units: Unit.Unit[]): boolean {
  if (units.length !== 1) {
    return false;
  }
  const [unit] = units;
  const ref = singleUnitRef(unit);
  if (!ref) {
    return false;
  }
  return isTypeCoercionTarget(ref);
}

function multiplyUnitMultipliers(
  units: Unit.Unit[] | null | undefined
): DeciNumber {
  return (units || []).reduce(
    (acc, unit) => acc.mul(unit.multiplier.pow(unit.exp)),
    N(1)
  );
}

function multiplyUnitMultipliersIfNeedsEnforcing(
  units: Unit.Unit[] | null | undefined
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
    return Dimension.automapTypes(
      ctx.utils,
      [await expressionType.isScalar('number')],
      (): Type => {
        return t.number(null, 'percentage');
      }
    );
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
    targetUnit = U(unitExpr.previousVarName ?? getIdentifierString(unitExpr), {
      known: false,
      aliasFor: unit,
    });
  }

  if (unit != null && isTypeCoercion(unit)) {
    return coerceType(ctx, expressionType, getDefined(singleUnitRef(unit[0])));
  }

  const ret = Dimension.automapTypes(
    ctx.utils,
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

function inlineUnitAliases(units: Unit.Unit[] | null): Unit.Unit[] | null {
  if (!units) {
    return null;
  }
  return units.reduce<Unit.Unit[]>((units, oneUnit) => {
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
): Promise<Value.Value> => {
  const [, expression, unitsExpression] = root.args;
  const expressionType = realm.getTypeAt(expression);
  const expressionValue = await evaluate(realm, expression);

  if (representsPercentage(unitsExpression)) {
    return Dimension.automapValues(
      realm.utils,
      [expressionType],
      [expressionValue],
      ([value], [type]) => {
        const noMultiplier = Unit.convertToMultiplierUnit(
          getInstanceof(value, Value.NumberValue).value,
          type.unit
        );
        return Value.NumberValue.fromValue(noMultiplier);
      }
    );
  }

  const targetUnitExpressionType = await (
    await inferExpression(realm, unitsExpression)
  ).isScalar('number');
  const { unit: targetUnit } =
    (targetUnitExpressionType.errorCause == null &&
      (await targetUnitExpressionType.reducedToLowest())) ||
    {};

  // type coercions
  if (targetUnit != null && isTypeCoercion(targetUnit)) {
    return coerceValue(
      realm,
      expressionType,
      expressionValue,
      getDefined(singleUnitRef(targetUnit[0]))
    );
  }

  const returnExpressionType = realm.getTypeAt(root);
  const targetUnitsEvalResult = await evaluate(realm, unitsExpression);
  const targetUnitsData = getInstanceof(
    await targetUnitsEvalResult.getData(),
    DeciNumber,
    `units needs to be a number:`
  );

  const targetUnitsExpressionType = realm.getTypeAt(unitsExpression);
  const targetUnits = inlineUnitAliases(targetUnitsExpressionType.unit);

  const targetUnitsMultiplier = multiplyUnitMultipliers(targetUnits);
  const targetMultiplierConversionRate = targetUnitsData.div(
    targetUnitsMultiplier
  );

  const returnTypeDivider = multiplyUnitMultipliersIfNeedsEnforcing(
    inlineUnitAliases(returnExpressionType.unit)
  );
  const conversionRate = targetMultiplierConversionRate.mul(returnTypeDivider);

  const sourceUnits = inlineUnitAliases(
    (await expressionType.reducedToLowest()).unit
  );

  return Dimension.automapValues(
    realm.utils,
    [expressionType],
    [expressionValue],
    async ([value]) => {
      if (value instanceof Value.NumberValue) {
        if (!targetUnits || !sourceUnits || sourceUnits.length < 1) {
          return Value.fromJS(
            (await value.getData()).div(conversionRate),
            Value.defaultValue(expressionType)
          );
        }

        const converted = convertBetweenUnits(
          await value.getData(),
          sourceUnits,
          targetUnits,
          { tolerateImprecision: true }
        );

        return Value.fromJS(
          converted.div(conversionRate),
          Value.defaultValue(expressionType)
        );
      }

      throw targetUnits
        ? InferError.cannotConvertToUnit(targetUnits)
        : new RuntimeError(
            `Don't know how to convert value to ${value?.getData()?.toString()}`
          );
    }
  );
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
