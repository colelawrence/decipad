import { singular } from 'pluralize';
import { getDefined } from '@decipad/utils';
import Fraction from '@decipad/fraction';

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
import { build as t, InferError, Type } from '../type';
import { stringifyUnits } from '../type/units';
import { areUnitsConvertible, convertBetweenUnits } from '../units';

import type { GetTypeCtx, GetValueCtx, Directive } from './types';
import { RuntimeError } from '../interpreter';

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
  const { unit } = unitExpressionType.reducedOrSelf();
  if (unit == null) {
    return t.impossible(`in/as right-side expression needs to have units`);
  }
  return automapTypes([expressionType], ([expressionType]: Type[]): Type => {
    const sourceUnits = expressionType.unit;
    if (!sourceUnits || sourceUnits.args.length === 0) {
      return t.number(unit);
    }

    if (!areUnitsConvertible(sourceUnits, unit)) {
      return t.impossible(
        InferError.cannotConvertBetweenUnits(sourceUnits, unit)
      );
    }

    return t.number(unit);
  });
}

export async function getValue(
  { evaluate, getNodeType }: GetValueCtx,
  expression: Expression,
  unitsExpression: Expression
): Promise<Value> {
  const evalResult = await evaluate(expression);
  const unitsEvalResult = await evaluate(unitsExpression);
  const unitsData = unitsEvalResult.getData();
  if (!(unitsData instanceof Fraction)) {
    throw new RuntimeError(`units needs to be a number`);
  }
  if (unitsData.compare(new Fraction(1)) !== 0) {
    throw new RuntimeError(`units needs to be 1`);
  }
  const expressionType = await getNodeType(expression);
  const sourceUnits = expressionType.reducedOrSelf().unit;
  const targetUnitsExpressionType = await getNodeType(unitsExpression);
  const units = getDefined(targetUnitsExpressionType.unit);
  return automapValues([expressionType], [evalResult], ([value]) => {
    if (value instanceof TimeQuantity) {
      if (units.args.length > 1) {
        throw new TypeError(
          `Don't know how to convert to composed unit ${stringifyUnits(units)}`
        );
      }

      const targetUnitAsString = units.args[0].unit;
      return fromJS(
        convertTimeQuantityTo(
          value as TimeQuantity,
          singular(targetUnitAsString.toLocaleLowerCase()) as Time.Unit
        )
      );
    }

    if (value instanceof FractionValue) {
      if (!sourceUnits || sourceUnits.args.length < 1) {
        return value;
      }
      const converted = convertBetweenUnits(
        value.getData(),
        sourceUnits,
        units
      );
      return fromJS(converted);
    }

    throw new TypeError(
      `Don't know how to convert value to ${stringifyUnits(units)}`
    );
  });
}

export const as: Directive = {
  argCount: 2,
  getType,
  getValue,
};
