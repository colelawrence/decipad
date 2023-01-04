import { css } from '@emotion/react';
import {
  antiwiggle,
  code,
  cssVar,
  setCssVar,
  smallScreenQuery,
  wiggle,
} from '../../primitives';
import { codeBlock } from '../../styles';

const { lineHeight } = codeBlock;

export const highlightedLineStyles = {
  borderColor: cssVar('borderHighlightColor'),
};

export const codeLineStyles = css({
  ':hover': highlightedLineStyles,
  position: 'relative',

  display: 'grid',
  // `minmax(0, X)` prevents a grid blowout when code line is made out of huge consecutive text.
  gridTemplate: `
    "fadeline-top-left top-border                top-border      top-border     fadeline-top-right" 0
    ".                 varname                   code            inline-res     .                 " 1fr
    ".                 mobile-varname            mobile-varname  mobile-varname .                 " auto
    ".                 mobile-code               mobile-code     mobile-code    .                 " auto
    ".                 expanded-res              expanded-res    expanded-res   .                 " auto
    "fadeline-bot-left bot-border                bot-border      bot-border     fadeline-bot-right" 0
    /0                 minmax(max-content, auto) minmax(0, 66%)  1fr            0
  `,

  [smallScreenQuery]: {
    // Layout per-line on mobile
    gridTemplate: `
      "fadeline-top-left top-border      fadeline-top-right" 0
      ".                 varname         .                 " auto
      ".                 code            .                 " auto
      ".                 inline-res      .                 " auto
      ".                 expanded-res    .                 " auto
      "fadeline-bot-left bot-border      fadeline-bot-right" 0
      /0                 1fr             0
    `,
  },
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

export const inlineStyles = css({
  gridArea: 'inline-res',
  maxWidth: '100%',
  display: 'flex',
  justifySelf: 'end',
  alignSelf: 'flex-start',
  padding: '5px 0',

  userSelect: 'all',
});

export const variableNameContainerStyles = css({
  gridArea: 'varname',
  display: 'flex',
  alignItems: 'center',
  padding: '4px 14px 4px 0',
});

export const codeContainerStyles = css(code, {
  gridArea: 'code',
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  lineHeight,
  whiteSpace: 'pre-wrap',
});

// TODO never used I think
export const placeholderStyles = css(codeContainerStyles, {
  opacity: 0.4,
  pointerEvents: 'none',

  [smallScreenQuery]: {
    position: 'absolute',
    left: '12px',
  },
});

export const canGrabStyles = css({
  cursor: 'grab',

  ':hover': {
    animation: `${antiwiggle} 0.5s ease-in-out`,
  },

  ':hover:after': {
    backgroundColor: 'blue',
    animation: `${wiggle} 0.5s ease-in-out`,
  },
});

export const grabbingStyles = css({
  cursor: 'grabbing',
});
