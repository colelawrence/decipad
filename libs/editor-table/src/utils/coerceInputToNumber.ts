export const coerceInputToNumber = (input: string) => {
  const nonNumericPattern = /[a-zA-Z]+/;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  const thousandSeparatorPatternEU = /^\d{1,3}(\.\d{3})+$/;
  const thousandSeparatorPatternUS = /^\d{1,3}(,\d{3})+$/;

  // European: e.g., "1.000,45"
  const europeanNumericPattern = /^\d{1,3}(\.\d{3})*(,\d+)?$/;
  // US or ambiguous: e.g., "123,456"
  const americanOrAmbiguousNumericPattern = /^\d{1,3}(,\d{3})*(\.\d+)?$/;
  // Should not change: e.g., "123,456" (ambiguous)
  const doNotChangePattern = /^(?:\d{1,3},\d{2,}|\d{1,3}\.\d{3})$/;

  // Check for dates, non-numeric patterns, or formats that should not change
  if (
    datePattern.test(input) ||
    nonNumericPattern.test(input) ||
    doNotChangePattern.test(input)
  ) {
    return input;
  }

  if (thousandSeparatorPatternEU.test(input)) {
    return input.includes(',') ? input : input.replace(/\./g, '');
  }

  if (thousandSeparatorPatternUS.test(input)) {
    return input.includes('.') ? input : input.replace(/,/g, '');
  }

  // Convert European format
  if (europeanNumericPattern.test(input)) {
    return input.replace(/\./g, '').replace(',', '.');
  }

  // Handle American or ambiguous numeric pattern
  if (americanOrAmbiguousNumericPattern.test(input)) {
    return input.replace(/,/g, '');
  }

  return input;
};
