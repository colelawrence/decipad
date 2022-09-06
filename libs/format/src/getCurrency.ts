import { ONE, toFraction } from '@decipad/fraction';
import { CurrencyUnits, getUnitByName, Unit } from '@decipad/language';
import { getDefined } from '@decipad/utils';

function isCurrencyUnit(unit: Unit | null): boolean {
  return (
    unit != null &&
    unit.baseSuperQuantity === 'currency' &&
    toFraction(unit.exp).equals(ONE)
  );
}

export function hasCurrency(unit: Unit[] | null): number {
  if (!unit) {
    return -1;
  }
  return unit.findIndex((arg) => isCurrencyUnit(arg));
}

export function getCurrency(unit: Unit[]): Unit {
  const currencyIndex = unit.findIndex(isCurrencyUnit);
  const currencyUnit = getDefined(
    (currencyIndex >= 0 && unit[currencyIndex]) || undefined
  );
  const currencyFromIdx = getUnitByName(currencyUnit.unit);

  return {
    ...currencyUnit,
    // avoid names like `$`, always use a standard currency identifier
    ...(currencyFromIdx ? { baseQuantity: currencyFromIdx.baseQuantity } : {}),
  };
}

export function getPrettyCurrency(unit: string): string {
  const unitDef = CurrencyUnits.units.filter((x) => x.baseQuantity === unit);
  if (unitDef[0] && unitDef[0].pretty) {
    return unitDef[0].pretty;
  }
  return unit;
}
