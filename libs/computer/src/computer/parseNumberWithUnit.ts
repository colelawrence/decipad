import { tokenRules } from '@decipad/language';

const captureNumberAndExpression = new RegExp(
  `^(${tokenRules.main.number.source})(.+)?$`
);

export function parseNumberWithUnit(source: string): [number, string] | null {
  const match = source.match(captureNumberAndExpression);
  if (!match) {
    return null;
  }

  const [, number, rest] = match;
  const parsedNumber = Number(number);

  if (Number.isNaN(parsedNumber)) {
    return null;
  }

  return [parsedNumber, rest ?? ''];
}
