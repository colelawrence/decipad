import { useRef, useEffect } from 'react';
import { css, SerializedStyles } from '@emotion/react';
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
  minWidth: 195,
});

const floatingMenuStyles = css({
  ...menuCardStyles,
  width: 180,
  position: 'absolute',
  left: '100%',
  top: -menuPadding,
});

type WithStyle = { style: SerializedStyles };

const Menu: React.FC<WithStyle> = ({ style, children }) => {
  // Focus the first button on mount
  const wrapperRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const firstButton: HTMLButtonElement | null =
      wrapperRef.current?.querySelector('button') ?? null;

    if (firstButton != null) {
      firstButton.focus();
    }
  }, []);

  return (
    <nav ref={wrapperRef} css={style}>
      <ul>{children}</ul>
    </nav>
  );
};

export const FloatingMenu: React.FC = ({ children }) => (
  <Menu style={floatingMenuStyles}>{children}</Menu>
);

export const DroopyMenu: React.FC = ({ children }) => (
  <Menu style={menuStyles}>{children}</Menu>
);
