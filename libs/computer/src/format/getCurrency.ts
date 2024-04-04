// eslint-disable-next-line no-restricted-imports
import type { Unit } from '@decipad/language';
// eslint-disable-next-line no-restricted-imports
import { CurrencyUnits, getUnitByName } from '@decipad/language';
import { N, ONE } from '@decipad/number';
import { getDefined } from '@decipad/utils';

function isCurrencyUnit(unit: Unit.Unit | null): boolean {
  return (
    unit != null &&
    unit.baseSuperQuantity === 'currency' &&
    N(unit.exp).equals(ONE)
  );
}

export function hasCurrency(unit: Unit.Unit[] | null): number {
  if (!unit) {
    return -1;
  }
  return unit.findIndex((arg) => isCurrencyUnit(arg));
}

export function getCurrency(unit: Unit.Unit[]): Unit.Unit {
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
