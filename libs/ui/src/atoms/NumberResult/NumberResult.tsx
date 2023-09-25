/* eslint decipad/css-prop-named-variable: 0 */
import { N } from '@decipad/number';
import { useComputer } from '@decipad/react-contexts';
import { FC } from 'react';
import { characterLimitStyles } from '../../styles/results';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';
import { useFormattedResultString } from '@decipad/ui';

export const NumberResult: FC<CodeResultProps<'number'>> = ({
  type,
  value,
  formatting = 'automatic',
  tooltip = true,
  variant = 'block',
}) => {
  const computer = useComputer();

  const formatted = computer.formatNumber(type, N(value));

  const [resultString, preciseString] = useFormattedResultString(
    formatted,
    formatting
  );

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

  if (!tooltip || resultString === preciseString) {
    return trigger;
  }

  return (
    <Tooltip trigger={trigger} stopClickPropagation>
      {preciseString}
    </Tooltip>
  );
};
