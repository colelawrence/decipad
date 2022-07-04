import {
  convertToMultiplierUnit,
  TUnits,
  normalizeUnitsOf,
} from '@decipad/language';
import FFraction, { FractionLike } from '@decipad/fraction';
import { formatUnit } from './formatUnit';
import { formatCurrency, isCurrency } from './formatCurrency';

const DECIMAL_PLACES_TEST_JUMP = 10;

const commatizeEveryThreeDigits = (
  digits: string,
  thousandsSep = ','
): string => {
  const numLeadingDigits = digits.length % 3 || 3;

  const segments = [];

  if (numLeadingDigits > 0) {
    segments.push(digits.slice(0, numLeadingDigits));
  }

  for (let i = numLeadingDigits; i < digits.length; i += 3) {
    const threeDigits = digits.slice(i, i + 3);

    segments.push(thousandsSep);
    segments.push(threeDigits);
  }

  return segments.join('');
};

const firstIndexOfNonZero = (n: string): number => {
  return n.split('').findIndex((c) => c !== '.' && c !== '0');
};

const roundIfNeeded = (f: FFraction, decimalPlaces: number): string => {
  let s = f.toString(decimalPlaces);
  const morePrecise = f.toString(decimalPlaces + 1);
  if (morePrecise !== s) {
    const nextNumber = Number(morePrecise[morePrecise.length - 1]);
    if (nextNumber >= 5) {
      const lastNumber = Number(s[s.length - 1]) + 1;
      s = s.slice(0, s.length - 1) + lastNumber;
    }
    return `${s}(...)`;
  }
  return s;
};

const formatFraction = (
  locale: string,
  f: FFraction,
  decimalPlaces: number
): string => {
  const s = f.toString(decimalPlaces);
  if (s === '0') {
    return s;
  }
  if (firstIndexOfNonZero(s) < 0) {
    return formatFraction(locale, f, decimalPlaces + DECIMAL_PLACES_TEST_JUMP);
  }
  const parts = s.split('.');
  let decimalPart = parts[1] as string;
  if (
    decimalPart &&
    decimalPart.length > decimalPlaces &&
    decimalPart.includes('(')
  ) {
    // There's a big repeating 0.(123456789) indicator
    // We remove the parens to force Fraction to un-repeat it, then round.
    const insideParensDecimalPart = decimalPart.match(/\((\d+)\)$/);
    if (insideParensDecimalPart) {
      const parensIndex = decimalPart.indexOf(
        `(${insideParensDecimalPart[1]})`
      );
      decimalPart = decimalPart.slice(0, parensIndex);
      while (decimalPart.length < decimalPlaces + 1) {
        decimalPart += insideParensDecimalPart[1];
      }
    }
    const backToTheOven = `${parts[0]}.${decimalPart}`;
    return roundIfNeeded(
      new FFraction(backToTheOven).round(decimalPlaces + 1),
      decimalPlaces
    );
  }
  return roundIfNeeded(f, decimalPlaces);
};

const removeExtraSpaces = (s: string) => {
  const result = s.replaceAll('  ', ' ').trim();
  return result;
};

export function formatNumber<TF extends FractionLike = FFraction>(
  locale: string,
  unit: TUnits<TF> | null | undefined,
  number: FractionLike,
  decimalPlaces = 5,
  thousandsSep = ','
): string {
  let fraction = new FFraction(number);
  if (unit) {
    const units = normalizeUnitsOf(unit);
    fraction = convertToMultiplierUnit(fraction, units);
    if (isCurrency(units)) {
      return formatCurrency(locale, unit, fraction, formatNumber);
    }
  }
  const asString = formatFraction(locale, fraction, decimalPlaces);

  // Numbers' toString isn't always formatted like [-]####.###
  const basicNumberMatch = asString.match(/^(-?)(\d+)(\.\d+)?$/);
  const unitPart = unit ? ` ${formatUnit(locale, unit, fraction)}` : '';
  if (basicNumberMatch != null) {
    const [, sign, integerPart, decimalPart = ''] = basicNumberMatch;

    const formattedIntegerPart =
      integerPart.length > 3
        ? commatizeEveryThreeDigits(integerPart, thousandsSep)
        : integerPart;

    const decimalSep = thousandsSep === ',' ? '.' : ',';
    const commatizedDecimalPart =
      decimalPart && `${decimalSep}${decimalPart.slice(1)}`;
    return removeExtraSpaces(
      `${sign}${formattedIntegerPart}${commatizedDecimalPart} ${unitPart}`
    );
  }

  return removeExtraSpaces(`${asString} ${unitPart}`);
}

export type FormatNumber = typeof formatNumber;
