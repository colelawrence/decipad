import { tokenRules } from '@decipad/language';

const captureNumberAndExpression = new RegExp(
  `^([^0-9]?[ ]?)(${tokenRules.main.number.match.source})(.+)?$`
);

export function parseNumberWithUnit(
  source: string
): [number, string, string] | null {
  const match = source.match(captureNumberAndExpression);
  if (!match) {
    return null;
  }
  const [, prefix, number, rest] = match;
  const parsedNumber = Number(number);
  if (Number.isNaN(parsedNumber)) {
    return null;
  }

  return [parsedNumber, rest ?? '', prefix];
}
