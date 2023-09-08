import { getDefined } from '@decipad/utils';
import { getUnitByName, Unit, type Realm, type Type } from '..';
import { NumberValue, Value } from '../value';
import { expandUnits, contractUnits } from './expand';
import { getInstanceof, zip } from '../utils';
import { automapValues } from '../dimtools';
import pSeries from 'p-series';
import { ONE } from '@decipad/number';

type TypeAndValue = [Type, Value];

async function autoconvertArgument(
  realm: Realm,
  value: Value,
  type: Type
): Promise<[Type, Value]> {
  const typeLowestDims = await type.reducedToLowest();
  const { unit: typeLowestDimsUnit } = typeLowestDims;
  if (typeLowestDimsUnit) {
    const [, expander] = expandUnits(typeLowestDimsUnit);
    const expandedValues = await automapValues(
      realm.inferContext,
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
  realm: Realm,
  typeAndValues: Array<TypeAndValue>
): Promise<Value[]> => {
  const consumedUnits = new Set<Unit>();
  return pSeries(
    typeAndValues.map(([sourceType, value]) => async () => {
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
                realm.inferContext,
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
  realm: Realm,
  value: Value,
  type: Type
): Promise<Value> {
  const typeLowestDims = await type.reducedToLowest();
  if (typeLowestDims.unit) {
    const [, contractor] = contractUnits(getDefined(typeLowestDims.unit));
    return automapValues(realm.inferContext, [type], [value], ([value]) => {
      if (value instanceof NumberValue) {
        return NumberValue.fromValue(contractor(value.value));
      }
      return value;
    });
  }
  return Promise.resolve(value);
}

export async function autoconvertArguments(
  realm: Realm,
  values: Value[],
  types: Type[]
): Promise<Value[]> {
  const autoConverted = await Promise.all(
    zip(values, types).map(async ([value, type]) =>
      autoconvertArgument(realm, value, type)
    )
  );

  return crossBaseConvert(realm, autoConverted);
}
