import { getDefined, getInstanceof, zip } from '@decipad/utils';
import { ONE } from '@decipad/number';
import type { Unit } from '@decipad/language-units';
import {
  contractUnits,
  expandUnits,
  getUnitByName,
} from '@decipad/language-units';
import type { ContextUtils } from '../ContextUtils';
import type { Value } from '../Value';
import { NumberValue } from '../Value';
import { type Type } from '../Type';
import { automapValues } from '../Dimension';

type TypeAndValue = [Type, Value];

async function autoconvertArgument(
  ctx: ContextUtils,
  value: Value,
  type: Type
): Promise<[Type, Value]> {
  const typeLowestDims = await type.reducedToLowest();
  const { unit: typeLowestDimsUnit } = typeLowestDims;
  if (typeLowestDimsUnit) {
    const [, expander] = expandUnits(typeLowestDimsUnit);
    const expandedValues = await automapValues(
      ctx,
      [type],
      [value],
      ([value]) => {
        if (value instanceof NumberValue) {
          return NumberValue.fromValue(expander(value.value));
        }
        return value;
      }
    );
    return [type, expandedValues];
  }
  return [type, value];
}

const crossBaseConvert = async (
  ctx: ContextUtils,
  typeAndValues: Array<TypeAndValue>
): Promise<Value[]> => {
  const consumedUnits = new Set<Unit.Unit>();
  return Promise.all(
    typeAndValues.map(async ([sourceType, value]) => {
      const { unit: sourceUnits } = sourceType;
      if (sourceUnits == null) {
        return value;
      }
      let convertedValue = value;
      for (const sourceUnit of sourceUnits) {
        if (consumedUnits.has(sourceUnit)) {
          continue;
        }
        const knownSourceUnit = getUnitByName(sourceUnit.unit);
        if (!knownSourceUnit) {
          continue;
        }

        for (const [otherType] of typeAndValues) {
          const { unit: otherUnits } = otherType;
          if (otherUnits == null || otherUnits === sourceUnits) {
            continue;
          }
          for (const otherUnit of otherUnits) {
            if (consumedUnits.has(otherUnit)) {
              continue;
            }
            const knownTargetUnit = getUnitByName(otherUnit.unit);
            if (
              !knownTargetUnit ||
              knownSourceUnit.name === knownTargetUnit.name ||
              knownSourceUnit.name === knownTargetUnit.baseQuantity
            ) {
              continue;
            }
            if (knownSourceUnit.canConvertTo?.(knownTargetUnit.baseQuantity)) {
              consumedUnits.add(otherUnit);
              consumedUnits.add(sourceUnit);
              // eslint-disable-next-line no-await-in-loop
              convertedValue = await automapValues(
                ctx,
                [sourceType],
                [convertedValue],
                ([value]) => {
                  const previousValue = getInstanceof(value, NumberValue).value;
                  const convert = getDefined(knownSourceUnit.convertTo);
                  const convFactor = convert(
                    knownTargetUnit.baseQuantity,
                    ONE
                  ).pow(sourceUnit.exp);
                  const newValue = previousValue.mul(convFactor);
                  return NumberValue.fromValue(newValue);
                }
              );
              break;
            }
          }
        }
      }
      return convertedValue;
    })
  );
};

export async function autoconvertResult(
  ctx: ContextUtils,
  value: Value,
  type: Type
): Promise<Value> {
  const typeLowestDims = await type.reducedToLowest();
  if (typeLowestDims.unit) {
    const [, contractor] = contractUnits(getDefined(typeLowestDims.unit));
    return automapValues(ctx, [type], [value], ([value]) => {
      if (value instanceof NumberValue) {
        return NumberValue.fromValue(contractor(value.value));
      }
      return value;
    });
  }
  return value;
}

export async function autoconvertArguments(
  ctx: ContextUtils,
  values: Value[],
  types: Type[]
): Promise<Value[]> {
  const autoConverted = await Promise.all(
    zip(values, types).map(async ([value, type]) =>
      autoconvertArgument(ctx, value, type)
    )
  );

  return crossBaseConvert(ctx, autoConverted);
}
