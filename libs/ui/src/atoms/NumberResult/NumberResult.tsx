import { FC } from 'react';
import { css } from '@emotion/react';
import { useComputer } from '@decipad/react-contexts';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';

const numberResultStyles = css({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  fontFeatureSettings: '"tnum"',
});

export const NumberResult: FC<CodeResultProps<'number'>> = ({
  type,
  value,
  tooltip = true,
}) => {
  const computer = useComputer();

  const fullResult = (
    <span css={numberResultStyles}>
      {computer.formatNumber(type.unit, value)}
    </span>
  );

  const trigger = <span css={numberResultStyles}>{fullResult}</span>;
  if (!tooltip) {
    return trigger;
  }

  return (
    <Tooltip trigger={trigger}>
      ~ {computer.formatNumber(type.unit, value, 10)}
    </Tooltip>
  );
};
