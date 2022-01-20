import { singular } from 'pluralize';
import Fraction from '@decipad/fraction';

import produce from 'immer';
import { RuntimeError } from '../interpreter';
import { convertTimeQuantityTo, Time } from '../date';
import { automapTypes, automapValues } from '../dimtools';
import {
  FractionValue,
  fromJS,
  TimeQuantity,
  Value,
} from '../interpreter/Value';
import { AST } from '../parser';
import { Expression } from '../parser/ast-types';
import { build as t, InferError, Type, Unit, Units } from '../type';
import { matchUnitArrays, stringifyUnits } from '../type/units';
import { areUnitsConvertible, convertBetweenUnits, parseUnit } from '../units';
import type { GetTypeCtx, GetValueCtx, Directive } from './types';
import { getIdentifierString, getInstanceof, U, u } from '../utils';

function isUserUnit(exp: AST.Ref, targetUnit: Units) {
  const unit: Units = {
    type: 'units',
    args: [parseUnit(getIdentifierString(exp))],
  };
  return !matchUnitArrays(unit, targetUnit);
}

export async function getType(
  { infer }: GetTypeCtx,
  expr: AST.Expression,
  unitExpr: AST.Expression
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
    targetUnit = U(
      u(getIdentifierString(unitExpr), { known: false, aliasFor: unit })
    );
  }
  return automapTypes([expressionType], ([expressionType]: Type[]): Type => {
    const sourceUnits = expressionType.unit;
    if (!sourceUnits || sourceUnits.args.length === 0) {
      return t.number(targetUnit);
    }

    if (unit && !areUnitsConvertible(sourceUnits, unit)) {
      return t.impossible(
        InferError.cannotConvertBetweenUnits(sourceUnits, unit)
      );
    }

    return t.number(targetUnit);
  });
}

function inlineUnitAliases(unit: Units): Units {
  return produce(unit, (unit) => {
    unit.args = unit.args.reduce<Unit[]>((units, oneUnit) => {
      if (oneUnit.aliasFor != null) {
        const unit = inlineUnitAliases(oneUnit.aliasFor);
        for (const u of unit.args) {
          units.push(u);
        }
      } else {
        units.push(oneUnit);
      }
      return units;
    }, []);
  });
}

export async function getValue(
  { evaluate, getNodeType }: GetValueCtx,
  expression: Expression,
  unitsExpression: Expression
): Promise<Value> {
  const evalResult = await evaluate(expression);
  const unitsEvalResult = await evaluate(unitsExpression);
  const unitsData = getInstanceof(
    unitsEvalResult.getData(),
    Fraction,
    `units needs to be a number`
  );

  const expressionType = await getNodeType(expression);
  const sourceUnits = expressionType.reducedToLowest().unit;
  const targetUnitsExpressionType = await getNodeType(unitsExpression);
  const units = targetUnitsExpressionType.unit
    ? inlineUnitAliases(targetUnitsExpressionType.unit)
    : undefined;

  return automapValues([expressionType], [evalResult], ([value]) => {
    if (value instanceof TimeQuantity) {
      if (units && units.args.length > 1) {
        throw new RuntimeError(
          `Don't know how to convert to composed unit ${stringifyUnits(units)}`
        );
      }

      const targetUnitAsString = singular(
        (units?.args[0].unit ?? '').toLocaleLowerCase()
      );
      return fromJS(
        convertTimeQuantityTo(
          value as TimeQuantity,
          targetUnitAsString as Time.Unit
        )
      );
    }

    if (value instanceof FractionValue) {
      if (!units || !sourceUnits || sourceUnits.args.length < 1) {
        return fromJS(value.getData().div(unitsData));
      }
      const converted = convertBetweenUnits(
        value.getData(),
        sourceUnits,
        units
      ).div(unitsData);
      return fromJS(converted);
    }

    throw new RuntimeError(
      `Don't know how to convert value to ${
        (units && stringifyUnits(units)) || value.getData().toString()
      }`
    );
  });
}

export const as: Directive = {
  argCount: 2,
  getType,
  getValue,
};
