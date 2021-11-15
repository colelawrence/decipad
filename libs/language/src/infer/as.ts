import { getDefined } from '@decipad/utils';
import produce from 'immer';
import { AST } from '../parser';
import { Type, build as t, InferError, setUnit } from '../type';
import { Context } from './context';
import { inferExpression } from '.';
import { getUnitByName, areUnitsConvertible } from '../units';
import { automapTypes } from '../dimtools';

export async function inferAs(
  ctx: Context,
  expr: AST.Expression,
  unit: AST.Units
): Promise<Type> {
  const expressionType = await inferExpression(ctx, expr);
  return automapTypes([expressionType], ([expressionType]: Type[]): Type => {
    if (unit.args.length !== 1) {
      return t.impossible(InferError.cannotConvertToUnit(unit));
    }

    const targetUnit = getDefined(unit.args[0]);
    const targetUnitName = targetUnit.unit;

    if (expressionType.timeUnits) {
      const targetUnitOfMeasure = getUnitByName(targetUnitName);
      if (
        !targetUnitOfMeasure ||
        !['month', 'day', 'second'].includes(targetUnitOfMeasure.baseQuantity)
      ) {
        return t.impossible(InferError.cannotConvertToUnit(unit));
      }
      return t.number(unit);
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

    return expressionType.mapType((expType) => setUnit(expType, unit));
  });
}
