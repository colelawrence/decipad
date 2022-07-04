import { FC } from 'react';
import { css } from '@emotion/react';
import { useComputer } from '@decipad/react-contexts';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';

const numberResultStyles = css({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
});

export const NumberResult: FC<CodeResultProps<'number'>> = ({
  type,
  value,
}) => {
  const computer = useComputer();

  const fullResult = (
    <span css={numberResultStyles}>
      {computer.formatNumber(type.unit, value)}
    </span>
  );

  return (
    <Tooltip trigger={<span css={numberResultStyles}>{fullResult}</span>}>
      ~ {computer.formatNumber(type.unit, value, 10)}
    </Tooltip>
  );
};
