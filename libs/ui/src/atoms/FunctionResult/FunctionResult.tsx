import { css } from '@emotion/react';
import { FC } from 'react';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';

const functionResultStyles = css({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: 'inline',
  verticalAlign: 'baseline',
  lineHeight: 1.2,
});

export const FunctionResult: FC<CodeResultProps<'function'>> = () => {
  const trigger = (
    <span data-highlight-changes css={functionResultStyles}>
      ƒ
    </span>
  );

  return <Tooltip trigger={trigger}>Function</Tooltip>;
};
