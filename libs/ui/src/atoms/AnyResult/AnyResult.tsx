import { css } from '@emotion/react';
import { FC } from 'react';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';

const numberResultStyles = css({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: 'inline',
  verticalAlign: 'baseline',
  lineHeight: 1.2,
});

export const AnyResult: FC<CodeResultProps<'anything'>> = () => {
  const trigger = (
    <span data-highlight-changes css={numberResultStyles}>
      ?
    </span>
  );

  return <Tooltip trigger={trigger}>Unknown value</Tooltip>;
};
