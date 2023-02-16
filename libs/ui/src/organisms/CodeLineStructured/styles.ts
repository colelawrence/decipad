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

  display: 'grid',
  // `minmax(0, X)` prevents a grid blowout when code line is made out of huge consecutive text.
  gridTemplate: `
    "varname                   code            inline-res    " 1fr
    "mobile-varname            mobile-varname  mobile-varname" auto
    "mobile-code               mobile-code     mobile-code   " auto
    "expanded-res              expanded-res    expanded-res  " auto
    /minmax(max-content, auto) minmax(0, 66%)  1fr
  `,

  [smallScreenQuery]: {
    // Layout per-line on mobile
    gridTemplate: `
      "varname         " auto
      "code            " auto
      "inline-res      " auto
      "expanded-res    " auto
      /1fr
    `,
  },
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
  padding: '4px 6px 4px 0',
});

export const codeContainerStyles = css(code, {
  gridArea: 'code',
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  lineHeight,

  [smallScreenQuery]: {
    borderLeft: 'none',
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
