import { compile } from 'moo';

interface I18nOptions {
  numberRegex: RegExp;
}
const tokenizer = (i18nOptions: I18nOptions) =>
  compile({
    number: i18nOptions.numberRegex,
  });

export function tolerantParser(source: string) {
  return Array.from(
    tokenizer({
      numberRegex: /1234/,
    }).reset(source)
  );
}
