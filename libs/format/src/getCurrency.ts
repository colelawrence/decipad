import FFraction, { FractionLike, ONE } from '@decipad/fraction';
import { CurrencyUnits, getUnitByName, TUnit, TUnits } from '@decipad/language';
import { getDefined } from '@decipad/utils';

function isCurrencyUnit<TF extends FractionLike = FFraction>(
  unit: TUnit<TF> | null
): boolean {
  return (
    unit != null &&
    unit.baseSuperQuantity === 'currency' &&
    new FFraction(unit.exp).equals(ONE)
  );
}

export function hasCurrency<TF extends FractionLike = FFraction>(
  unit: TUnits<TF> | null
): number {
  if (!unit) {
    return -1;
  }
  return unit.args.findIndex((arg) => isCurrencyUnit(arg));
}

export function getCurrency<TF extends FractionLike = FFraction>(
  unit: TUnits<TF>
): TUnit<TF> {
  const currencyIndex = unit.args.findIndex(isCurrencyUnit);
  const currencyUnit = getDefined(
    (currencyIndex >= 0 && unit?.args[currencyIndex]) || undefined
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
