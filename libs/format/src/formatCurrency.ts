import FFraction, { FractionLike, ONE } from '@decipad/fraction';
import { TUnit, TUnits } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import produce from 'immer';
import { formatUnit } from './formatUnit';
import { formatNumber as defaultFormatNumber } from './formatNumber';

function isCurrencyUnit<TF extends FractionLike = FFraction>(
  unit: TUnit<TF> | null
): boolean {
  return (
    unit != null &&
    unit.baseSuperQuantity === 'currency' &&
    new FFraction(unit.exp).equals(ONE)
  );
}

export function isCurrency<TF extends FractionLike = FFraction>(
  unit: TUnits<TF> | null
): boolean {
  if (unit?.args.length === 1) {
    return isCurrencyUnit(unit.args[0]);
  }
  return false;
}

export function formatCurrency<TF extends FractionLike = FFraction>(
  locale: string,
  unit: TUnits<TF>,
  number: FFraction,
  formatNumber = defaultFormatNumber
): string {
  const currencyIndex = unit.args.findIndex(isCurrencyUnit);
  const currencyUnit = getDefined(
    (currencyIndex >= 0 && unit?.args[currencyIndex]) || undefined
  );
  const unitWithoutCurrency = produce(unit, (u) => {
    // eslint-disable-next-line no-param-reassign
    u.args = u.args.filter((un) => !isCurrencyUnit(un));
  });

  const currencyFullUnit: TUnits<TF> = {
    type: 'units',
    args: [currencyUnit],
  };

  const currencyFormatted = formatUnit(locale, currencyFullUnit);
  const numberAsString = formatNumber(
    locale,
    null,
    number,
    2,
    currencyUnit.thousandsSeparator
  );
  const restUnitFormated = formatUnit(
    locale,
    unitWithoutCurrency,
    undefined,
    true,
    1
  );

  const sep = currencyUnit.hasNoSpaceBetweenUnitAndNumber ? '' : ' ';
  const currencyAndNumber = (
    currencyUnit.isPrefix
      ? [currencyFormatted, sep, numberAsString]
      : [numberAsString, sep, currencyFormatted]
  ).join('');

  return `${currencyAndNumber} ${restUnitFormated}`.trim();
}
