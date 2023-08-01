/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { Settings } from '../../icons';
import { cssVar, p13Medium } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';

const buttonStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '4px',
  ':hover, :focus': {
    backgroundColor: cssVar('backgroundSubdued'),
  },
});

const iconStyles = css({
  width: '12px',
});

const buttonTextStyles = css(p13Medium, {
  whiteSpace: 'nowrap',
  padding: '0 4px',
});

export interface LiveDataSetParamsProps {
  onClick: () => void;
}

export const LiveDataSetParams: FC<LiveDataSetParamsProps> = ({ onClick }) => {
  return (
    <button css={[buttonStyles, hideOnPrint]} onClick={onClick}>
      <span css={iconStyles}>{<Settings />}</span>
      <span css={buttonTextStyles}>Options</span>
    </button>
  );
};
