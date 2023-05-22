import { useComputer } from '@decipad/react-contexts';
import { FC } from 'react';
import { N } from '@decipad/number';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';
import { characterLimitStyles } from '../../styles/results';

export const NumberResult: FC<CodeResultProps<'number'>> = ({
  type,
  value,
  tooltip = true,
  variant = 'block',
}) => {
  const computer = useComputer();

  const formatted = computer.formatNumber(type, N(value));

  const fullResult = (
    <span
      css={
        tooltip && [
          characterLimitStyles,
          variant === 'inline' ? { maxWidth: '120px' } : { maxWidth: '205px' },
        ]
      }
    >
      {formatted.asString}
    </span>
  );
  const trigger = (
    <span
      data-testid={`number-result:${formatted.asString}`}
      data-highlight-changes
    >
      {fullResult}
    </span>
  );

  if (!tooltip || formatted.asString === formatted.asStringPrecise) {
    return trigger;
  }

  return (
    <Tooltip trigger={trigger} stopClickPropagation>
      {formatted.asStringPrecise}
    </Tooltip>
  );
};
