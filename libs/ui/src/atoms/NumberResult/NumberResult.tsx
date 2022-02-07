import { FC } from 'react';
import { css } from '@emotion/react';
import {
  stringifyUnits,
  deserializeUnit,
  convertToMultiplierUnit,
} from '@decipad/language';
import Fraction from '@decipad/fraction';
import { CodeResultProps } from '../../types';

const commaStyles = css({
  userSelect: 'none',
});

const numberResultStyles = css({
  wordBreak: 'break-all',
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

    segments.push(
      <span key={i} css={commaStyles}>
        ,
      </span>
    );
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

const toString = (f: Fraction, decimalPlaces = 15): string => {
  const s = f.toString(decimalPlaces);
  if (s === '0') {
    return s;
  }
  if (firstIndexOfNonZero(s) < 0) {
    return toString(f, decimalPlaces + DECIMAL_PLACES_TEST_JUMP);
  }
  return roundIfNeeded(f, decimalPlaces);
};

export const NumberResult = ({
  type,
  value,
}: CodeResultProps<'number'>): ReturnType<FC> => {
  let fraction = new Fraction(value);
  if (type.unit) {
    fraction = convertToMultiplierUnit(fraction, type.unit);
  }
  const asString = toString(fraction);

  // Numbers' toString isn't always formatted like [-]####.###
  const basicNumberMatch = asString.match(/^(-?)(\d+)(\.\d+)?$/);
  const unitPart = type.unit
    ? ` ${stringifyUnits(deserializeUnit(type.unit), fraction)}`
    : '';
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
    <span css={numberResultStyles}>
      {[asString, unitPart].filter(Boolean).join(' ')}
    </span>
  );
};
