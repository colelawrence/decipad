import { useComputer } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC } from 'react';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';

const numberResultStyles = css({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: 'inline-block',
  verticalAlign: 'middle',
  lineHeight: 1.2,
  fontFeatureSettings: '"tnum"',
});

export const NumberResult: FC<CodeResultProps<'number'>> = ({
  type,
  value,
  tooltip = true,
}) => {
  const computer = useComputer();

  const formatted = computer.formatNumber(type, value);

  const fullResult = <span css={numberResultStyles}>{formatted.asString}</span>;

  const trigger = <span css={numberResultStyles}>{fullResult}</span>;
  if (!tooltip) {
    return trigger;
  }

  return <Tooltip trigger={trigger}>{formatted.asStringPrecise}</Tooltip>;
};
