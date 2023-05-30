/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { HTMLAttributes } from 'react';
import { cssVar } from '../../primitives/index';

export const floatingButtonStyles = css({
  backgroundColor: 'transparent',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  borderRadius: '3px',
  padding: '0 8px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-out',
  '&:hover': {
    backgroundColor: `${cssVar('highlightColor')}`,
  },
  '> div > svg > path': {
    transition: 'stroke 0.2s ease-out',
  },
});

const activeFloatingButtonStyles = css({
  '> div > svg > path': {
    stroke: `${cssVar('normalTextColor')}`,
    strokeWidth: '2',
  },
});

export interface FloatingButtonProps extends HTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export const FloatingButton = ({ isActive, ...props }: FloatingButtonProps) => (
  <button
    css={[floatingButtonStyles, isActive && activeFloatingButtonStyles]}
    {...props}
  />
);
