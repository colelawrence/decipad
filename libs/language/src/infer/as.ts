import { getDefined } from '@decipad/utils';
import produce from 'immer';
import { AST } from '../parser';
import { Type, build as t, InferError } from '../type';
import { Context } from './context';
import { inferExpression } from '.';
import { getUnitByName, areUnitsConvertible } from '../units';

export async function inferAs(
  ctx: Context,
  expr: AST.Expression,
  units: AST.Unit[]
): Promise<Type> {
  const expressionType = await inferExpression(ctx, expr);
  if (units.length !== 1) {
    return t.impossible(InferError.cannotConvertToUnit(units));
  }

  const targetUnitName = getDefined(units[0].unit);

  if (expressionType.timeUnits) {
    const targetUnit = getUnitByName(targetUnitName);
    if (!targetUnit || targetUnit.baseQuantity !== 'time') {
      return t.impossible(InferError.cannotConvertToUnit(units));
    }
  }

  if (expressionType.type === 'number') {
    const sourceUnits = expressionType.unit;
    if (sourceUnits && sourceUnits.length > 1) {
      return t.impossible(
        InferError.cannotConvertBetweenUnits(sourceUnits, units)
      );
    }
    if (!sourceUnits || sourceUnits.length === 0) {
      return t.number(units);
    }

    const sourceUnit = sourceUnits[0];
    const sourceUnitName = sourceUnit.unit;

    if (!areUnitsConvertible(sourceUnitName, targetUnitName)) {
      return t.impossible(
        InferError.cannotConvertBetweenUnits(sourceUnits, units)
      );
    }

    const resultUnit = produce(sourceUnit, (unit) => {
      unit.unit = targetUnitName;
    });

    return t.number([resultUnit]);
  }

  return t.impossible(`Don't know how to convert`);
}
