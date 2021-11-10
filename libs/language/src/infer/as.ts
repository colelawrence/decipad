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
  unit: AST.Units
): Promise<Type> {
  const expressionType = await inferExpression(ctx, expr);
  if (unit.args.length !== 1) {
    return t.impossible(InferError.cannotConvertToUnit(unit));
  }

  const targetUnitName = getDefined(unit.args[0].unit);

  if (expressionType.timeUnits) {
    const targetUnit = getUnitByName(targetUnitName);
    if (!targetUnit || targetUnit.baseQuantity !== 'time') {
      return t.impossible(InferError.cannotConvertToUnit(unit));
    }
  }

  if (expressionType.type === 'number') {
    const sourceUnits = expressionType.unit;
    if (sourceUnits && sourceUnits.args.length > 1) {
      return t.impossible(
        InferError.cannotConvertBetweenUnits(sourceUnits, unit)
      );
    }
    if (!sourceUnits || sourceUnits.args.length === 0) {
      return t.number(unit);
    }

    const sourceUnit = sourceUnits.args[0];
    const sourceUnitName = sourceUnit.unit;

    if (!areUnitsConvertible(sourceUnitName, targetUnitName)) {
      return t.impossible(
        InferError.cannotConvertBetweenUnits(sourceUnits, unit)
      );
    }

    const resultUnit = produce(sourceUnit, (unit) => {
      unit.unit = targetUnitName;
    });

    return t.number([resultUnit]);
  }

  return t.impossible(`Don't know how to convert`);
}
