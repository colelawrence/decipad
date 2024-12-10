/* eslint-disable no-restricted-imports */
import { Unit as TUnit, AST, Type } from '@decipad/language-interfaces';
import { getDefined, identity } from '@decipad/utils';
import {
  Dimension,
  InferError,
  Unit,
  areUnitsConvertible,
  parseUnit,
  buildType as t,
} from '@decipad/language-types';
import { getIdentifierString, U } from '@decipad/language-utils';
import { DirectiveImpl } from '../types';
import { coerceType } from '../../type-coercion';
import { inferExpression } from '../../infer/infer';
import { TScopedRealm } from '../../scopedRealm';
import { representsPercentage } from './utils/representsPercentage';
import { isTypeCoercion } from './utils/isTypeCoercion';
import { singleUnitRef } from './utils/singleUnitRef';

function isUserUnit(exp: AST.Expression, targetUnit: TUnit[]) {
  if (exp.type !== 'ref') {
    return false;
  }
  const unit: TUnit[] = [parseUnit(getIdentifierString(exp))];
  return !Unit.matchUnitArrays(unit, targetUnit);
}

const getNumberType = async (
  ctx: TScopedRealm,
  expressionType: Type,
  unitExpr: AST.Expression,
  buildType: (numberType: Type) => Type = identity
): Promise<Type> => {
  if (representsPercentage(unitExpr)) {
    const reducedToLowest = await (
      await expressionType.reducedToLowest()
    ).isScalar('number');
    if (reducedToLowest.errorCause) {
      return reducedToLowest;
    }
    return Dimension.automapTypes(ctx.utils, [expressionType], (): Type => {
      return buildType(t.number(null, 'percentage'));
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
    targetUnit = U(unitExpr.previousVarName ?? getIdentifierString(unitExpr), {
      known: false,
      aliasFor: unit,
    });
  }

  if (targetUnit != null && isTypeCoercion(targetUnit)) {
    return buildType(
      await coerceType(
        ctx,
        expressionType,
        getDefined(singleUnitRef(targetUnit[0]))
      )
    );
  }

  return Dimension.automapTypes(
    ctx.utils,
    [expressionType],
    ([expressionType]: Type[]): Type => {
      const sourceUnits = expressionType.unit;
      if (!sourceUnits || sourceUnits.length === 0) {
        return buildType(t.number(targetUnit));
      }

      if (unit && !areUnitsConvertible(sourceUnits, unit)) {
        if (
          areUnitsConvertible(sourceUnits, unit, { tolerateImprecision: true })
        ) {
          // Only imprecision available today
          return buildType(
            t.number(targetUnit, undefined, 'month-day-conversion')
          );
        }
        return t.impossible(
          InferError.cannotConvertBetweenUnits(sourceUnits, unit)
        );
      }

      return buildType(t.number(targetUnit));
    }
  );
};

const getTrendType = async (
  ctx: TScopedRealm,
  expressionType: Type,
  unitExpr: AST.Expression
): Promise<Type> =>
  getNumberType(
    ctx,
    expressionType.trendOf ?? expressionType,
    unitExpr,
    (type) => t.trend({ trendOf: type })
  );

export const getType: DirectiveImpl<AST.AsDirective>['getType'] = async (
  ctx,
  { args: [, expr, unitExpr] }
): Promise<Type> => {
  const expressionType = await inferExpression(ctx, expr);
  if (expressionType.errorCause) {
    return expressionType;
  }
  const reducedToLowest = await expressionType.reducedToLowest();
  if (reducedToLowest.trendOf) {
    return getTrendType(ctx, expressionType, unitExpr);
  }

  return getNumberType(ctx, expressionType, unitExpr);
};
