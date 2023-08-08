import { css } from '@emotion/react';
import {
  antiwiggle,
  code,
  cssVar,
  mobileQuery,
  smallScreenQuery,
  wiggle,
} from '../../primitives';
import { codeBlock } from '../../styles';

const { lineHeight } = codeBlock;

export const highlightedLineStyles = {
  borderColor: cssVar('borderDefault'),
};

export const codeLineStyles = css({
  ':hover': highlightedLineStyles,
  display: 'flex',
  [mobileQuery]: {
    flexDirection: 'column',
  },
});

export const inlineStyles = css({
  gridArea: 'inline-res',
  maxWidth: 'min(30vw, 174px)',
  display: 'inline-flex',
  justifySelf: 'end',
  alignSelf: 'flex-start',
  padding: '5px 0',

  float: 'right',
  whiteSpace: 'normal',

  userSelect: 'none',
});

export const variableNameContainerStyles = css({
  gridArea: 'varname',
  display: 'flex',
  alignItems: 'center',
  padding: '4px 6px 4px 0',
  flexShrink: '0',
});

export const codeContainerStyles = css(code, {
  gridArea: 'code',

  lineHeight,
  display: 'block',
  flexGrow: 1,
  gap: '16px',
  overflowWrap: 'anywhere',

  [smallScreenQuery]: {
    borderLeft: 'none',
  },

  // Why is this here? Well, when the text is empty, slate seems to add a <br> element.
  // I'm not sure why the reason, but at this point I am scared to ask.
  // So we just don't display it. This isn't an issue if you use display: flex, but
  // in this case this is an inline element.
  br: {
    display: 'none',
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
