/* eslint decipad/css-prop-named-variable: 0 */
import { FC } from 'react';
import { characterLimitStyles } from '../../styles/results';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';
import { css } from '@emotion/react';
import { useFormattedResultString } from '../../hooks';
import { formatNumber } from '@decipad/format';

export const NumberResult: FC<CodeResultProps<'number'>> = ({
  type,
  value,
  formatting = 'automatic',
  tooltip = true,
  variant = 'block',
}) => {
  const formatted = formatNumber(
    'en-US',
    type.unit,
    value,
    type.numberFormat,
    type.numberError === 'month-day-conversion'
  );

  const unitPart = formatted.partsOf?.find(
    (part) => part.type === 'unit'
  )?.value;
  const currencyPart = formatted.partsOf?.find(
    (part) => part.type === 'currency'
  )?.value;

  const [resultString] = useFormattedResultString(formatted, formatting);

  const displayString =
    type.numberFormat === 'percentage' ? formatted.asString : resultString;

  const trigger = (
    <span
      data-testid={`number-result:${formatted.asString}`}
      data-highlight-changes
      css={
        tooltip && [
          characterLimitStyles,
          variant === 'inline' ? { maxWidth: '120px' } : { maxWidth: '205px' },
        ]
      }
    >
      {displayString}
    </span>
  );

  if (!tooltip || resultString === formatted.asStringPrecise) {
    return trigger;
  }

  return (
    <Tooltip trigger={trigger} stopClickPropagation>
      {unitPart ? (
        <>
          <p>
            {currencyPart}
            {formatted.asStringPrecise}
          </p>
          <p css={css({ fontStyle: 'italic' })}>{unitPart}</p>
        </>
      ) : (
        <p>
          {currencyPart}
          {formatted.asStringPrecise}
        </p>
      )}
    </Tooltip>
  );
};
