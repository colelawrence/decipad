import { FC } from 'react';
import { css } from '@emotion/react';
import {
  convertToMultiplierUnit,
  normalizeUnitsOf,
  stringifyUnits,
} from '@decipad/computer';
import Fraction from '@decipad/fraction';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';

const numberResultStyles = css({
  wordBreak: 'break-all',
  userSelect: 'all',
});

const DECIMAL_PLACES_TEST_JUMP = 10;

const commatizeEveryThreeDigits = (digits: string) => {
  const numLeadingDigits = digits.length % 3 || 3;

  const segments = [];

  if (numLeadingDigits > 0) {
    segments.push(digits.slice(0, numLeadingDigits));
  }

  for (let i = numLeadingDigits; i < digits.length; i += 3) {
    const threeDigits = digits.slice(i, i + 3);

    segments.push(<span key={i}>,</span>);
    segments.push(threeDigits);
  }

  return segments;
};

const firstIndexOfNonZero = (n: string): number => {
  return n.split('').findIndex((c) => c !== '.' && c !== '0');
};

const roundIfNeeded = (f: Fraction, decimalPlaces: number): string => {
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

const toString = (f: Fraction, decimalPlaces = 5): string => {
  const s = f.toString(decimalPlaces);
  if (s === '0') {
    return s;
  }
  if (firstIndexOfNonZero(s) < 0) {
    return toString(f, decimalPlaces + DECIMAL_PLACES_TEST_JUMP);
  }
  const decimalPart = s.split('.').pop() as string;
  if (decimalPart.length > decimalPlaces && decimalPart.includes('(')) {
    // There's a big repeating 0.(123456789) indicator
    // We remove the parens to force Fraction to un-repeat it, then round.
    const noParens = s.replace(/\((\d+)\)$/, '$1');
    return roundIfNeeded(new Fraction(noParens), decimalPlaces);
  }
  return roundIfNeeded(f, decimalPlaces);
};

export const NumberResult = ({
  type,
  value,
}: CodeResultProps<'number'>): ReturnType<FC> => {
  let fraction = new Fraction(value);
  if (type.unit) {
    const units = normalizeUnitsOf(type.unit);
    fraction = convertToMultiplierUnit(fraction, units);
  }
  const asString = toString(fraction);

  // Numbers' toString isn't always formatted like [-]####.###
  const basicNumberMatch = asString.match(/^(-?)(\d+)(\.\d+)?$/);
  const unitPart = type.unit ? ` ${stringifyUnits(type.unit, fraction)}` : '';
  if (basicNumberMatch != null) {
    const [, sign, integerPart, decimalPart] = basicNumberMatch;

    const formattedIntegerPart =
      integerPart.length > 3
        ? commatizeEveryThreeDigits(integerPart)
        : integerPart;

    return (
      <span css={numberResultStyles}>
        {sign}
        {formattedIntegerPart}
        {decimalPart}
        {unitPart}
      </span>
    );
  }

  return (
    <Tooltip
      trigger={
        <span css={numberResultStyles}>
          {[asString, unitPart].filter(Boolean).join(' ')}
        </span>
      }
    >
      ~ {toString(fraction, 10)} {unitPart}
    </Tooltip>
  );
};
