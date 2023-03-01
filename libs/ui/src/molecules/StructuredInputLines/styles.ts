import { css } from '@emotion/react';
import { cssVar } from '../../primitives';

export const structuredInputContainerStyles = css({
  position: 'relative',
  display: 'grid',
  gridTemplate: `
    "fadeline-top-left top-border     fadeline-top-right" 0
    ".                 children       .                 " auto
    "fadeline-bot-left bot-border     fadeline-bot-right" 0
    /0                 minmax(0, 1fr)            0
  `,
});

export const childrenStyles = css({
  gridArea: 'children',
});

export const borderStyles = (pos: 'top' | 'bot') =>
  css({
    gridArea: `${pos}-border`,
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    right: 0,
    borderTop: `1px solid ${cssVar('borderColor')}`,
  });

export const borderTopStyles = borderStyles('top');
export const borderBotStyles = borderStyles('bot');

export const fadeLineStyles = (pos: 'top' | 'bot', side: 'left' | 'right') =>
  css({
    gridArea: `fadeline-${pos}-${side}`,
    pointerEvents: 'none',
    position: 'absolute',
    left: side === 'right' ? 0 : undefined,
    right: side === 'left' ? 0 : undefined,
    width: 64,
    borderTop: `1px solid ${cssVar('borderColor')}`,
    // Fade out the fadeline borders using a mask
    maskImage:
      side === 'right'
        ? `linear-gradient(to right, fuchsia, transparent)`
        : `linear-gradient(to left, fuchsia, transparent)`,
  });

export const fadeLineTopLeftStyles = fadeLineStyles('top', 'left');
export const fadeLineTopRightStyles = fadeLineStyles('top', 'right');
export const fadeLineBotLeftStyles = fadeLineStyles('bot', 'left');
export const fadeLineBotRightStyles = fadeLineStyles('bot', 'right');
