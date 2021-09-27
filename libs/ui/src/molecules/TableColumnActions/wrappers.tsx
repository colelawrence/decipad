import { useRef, useEffect } from 'react';
import { css } from '@emotion/react';
import { card } from '../../styles';
import {
  subtleBorder,
  subtleShadow,
  transparency,
  white,
} from '../../primitives';

const menuPadding = 6;

const menuCardStyles = {
  ...card.styles,
  border: `1px solid ${subtleBorder.rgb}`,
  boxShadow: `0px 1px 2px ${
    transparency(subtleShadow, 0.02).rgba
  }, 0px 2px 12px ${transparency(subtleShadow, 0.08).rgba}`,
  padding: menuPadding,
  display: 'grid',
  backgroundColor: white.rgb,
};

const menuStyles = css({
  ...menuCardStyles,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderTop: '0 none',
  width: 195,
});

const floatingMenuStyles = css({
  ...menuCardStyles,
  width: 180,
  position: 'absolute',
  left: '100%',
  top: -menuPadding,
});

export const FloatingMenu: React.FC = ({ children }) => {
  // Focus the first button
  const wrapperRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const firstFocusable = wrapperRef.current?.querySelector(
      'button'
    ) as HTMLButtonElement | null;
    firstFocusable?.focus();
  }, []);

  return (
    <nav ref={wrapperRef} css={floatingMenuStyles}>
      <ul>{children}</ul>
    </nav>
  );
};

export const DroopyMenu: React.FC = ({ children }) => {
  return (
    <nav css={menuStyles}>
      <ul>{children}</ul>
    </nav>
  );
};
