import { getDefined } from '@decipad/utils';
import produce from 'immer';
import { singular } from 'pluralize';

import { convertTimeQuantityTo, Time } from '../date';
import { automapTypes, automapValues } from '../dimtools';
import {
  FractionValue,
  fromJS,
  TimeQuantity,
  Value,
} from '../interpreter/Value';
import { AST } from '../parser';
import { Expression, Units } from '../parser/ast-types';
import { build as t, InferError, setUnit, Type } from '../type';
import { stringifyUnits } from '../type/units';
import {
  areUnitsConvertible,
  convertBetweenUnits,
  getUnitByName,
} from '../units';

import type { GetTypeCtx, GetValueCtx, Directive } from './types';

export async function getType(
  { infer }: GetTypeCtx,
  expr: AST.Expression,
  unit: AST.Units
): Promise<Type> {
  const expressionType = await infer(expr);
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
        unit.multiplier = targetUnit.multiplier;
      });

      return t.number([resultUnit]);
    }

    return expressionType.mapType((expType) => setUnit(expType, unit));
  });
}

export async function getValue(
  { evaluate, getNodeType }: GetValueCtx,
  expression: Expression,
  units: Units
): Promise<Value> {
  const evalResult = await evaluate(expression);

  if (units.args.length > 1) {
    throw new TypeError(
      `Don't know how to convert to composed unit ${stringifyUnits(units)}`
    );
  }

  const targetUnitAsString = units.args[0].unit;

  const expressionType = await getNodeType(expression);
  return automapValues([expressionType], [evalResult], ([value]) => {
    if (value instanceof TimeQuantity) {
      return fromJS(
        convertTimeQuantityTo(
          value as TimeQuantity,
          singular(targetUnitAsString.toLocaleLowerCase()) as Time.Unit
        )
      );
    }

    if (value instanceof FractionValue) {
      const sourceUnits = expressionType.unit;
      if (!sourceUnits || sourceUnits.args.length < 1) {
        return evalResult;
      }
      if (sourceUnits.args.length > 1) {
        throw new TypeError(
          `Don't know how to convert to composed units ${stringifyUnits(
            sourceUnits
          )}`
        );
      }
      return fromJS(
        convertBetweenUnits(value.getData(), sourceUnits.args[0], units.args[0])
      );
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
