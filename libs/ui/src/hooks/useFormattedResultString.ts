import { NumberFormatting } from '@decipad/editor-types';
import { DeciNumberRep } from '@decipad/format';
import { useCallback, useMemo } from 'react';

export const useFormattedResultString = (
  value: DeciNumberRep,
  formatting: NumberFormatting
) => {
  const unit = useMemo(
    () => value.partsOf.find((part) => part.type === 'unit')?.value || '',
    [value]
  );

  const currency = useMemo(
    () => value.partsOf.find((part) => part.type === 'currency')?.value || '',
    [value]
  );

  const buildString = useCallback(
    (p: string) => `${currency}${p}${unit ? ` ${unit}` : ''}`,
    [currency, unit]
  );

  const { formatOptions } = value;

  const financialString = useMemo(
    () => (formatOptions ? buildString(formatOptions.financialString) : ''),
    [formatOptions, buildString]
  );
  const preciseString = useMemo(
    () => (formatOptions ? buildString(formatOptions.preciseString) : ''),
    [formatOptions, buildString]
  );
  const scientificString = useMemo(
    () => (formatOptions ? buildString(formatOptions.scientificString) : ''),
    [formatOptions, buildString]
  );

  const automaticString = useMemo(() => value.asString, [value]);

  const getFormattedResultString = useCallback(
    (p: string) => {
      switch (p) {
        case 'financial':
          return financialString;
        case 'precise':
          return preciseString;
        case 'automatic':
          return automaticString;
        case 'scientific':
          return scientificString;
        default:
          return automaticString;
      }
    },
    [financialString, preciseString, scientificString, automaticString]
  );

  const resultString = useMemo(
    () =>
      formatOptions ? getFormattedResultString(formatting) : automaticString,
    [getFormattedResultString, formatting, formatOptions, automaticString]
  );

  return resultString;
};
