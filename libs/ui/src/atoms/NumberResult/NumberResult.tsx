import { FC } from 'react';
import { css } from '@emotion/react';
import { stringifyUnits } from '@decipad/language';
import Fraction from '@decipad/fraction';
import { ResultProps } from '../../lib/results';

const commaStyles = css({
  userSelect: 'none',
});

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

const removeFpArtifacts = (decimalPart: string) => {
  if (decimalPart.length > 8) {
    // Round to 8 places. If the rounding ends in zeroes,
    // that's a heuristic telling us that the FP error has
    // probably been eliminated
    const rounded = Number(`0${decimalPart}`).toFixed(8);

    const [, digits, zeroes] = rounded.match(/0\.(\d+?)(0+)$/) ?? [];
    if (digits && zeroes) {
      return `.${digits}`;
    }
  }

  return decimalPart;
};

export const NumberResult = ({
  type,
  value,
}: ResultProps<'number'>): ReturnType<FC> => {
  const fraction = new Fraction(value);
  const asString = fraction.toString();

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
      <span>
        {sign}
        {formattedIntegerPart}
        {decimalPart && removeFpArtifacts(decimalPart)}
        {unitPart}
      </span>
    );
  }

  return <span>{[asString, unitPart].filter(Boolean).join(' ')}</span>;
};
