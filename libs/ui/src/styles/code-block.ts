import { css, CSSObject } from '@emotion/react';
import { code, cssVar, p13Regular } from '../primitives';
import { Height } from './spacings';

export const lineHeight = '2';

export const variableStyles: CSSObject = {
  ...code,
  backgroundColor: cssVar('borderSubdued'),
  fontWeight: 500,
  fontSize: '13px',
};

export const varStyles = css(variableStyles, {
  padding: '2px 4px',
  borderRadius: '6px',
  fontSize: '13px',
  whiteSpace: 'nowrap',
  '@media print': {
    background: 'unset',
    color: cssVar('textDefault'),
  },
});

export const structuredVariableStyles: CSSObject = {
  ...p13Regular,
  lineHeight: '1.6',
  minHeight: Height.Bubble,
};

export const pAdvCalcStyles = css(structuredVariableStyles, {
  padding: '4px 6px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  width: 'fit-content',
});

export const pIconStyles = css({
  position: 'relative',
  top: -1,
  left: -1,
  display: 'inline-flex',
  verticalAlign: 'text-top',
  height: '16px',
  width: '16px',
  marginRight: '2px',
  pointerEvents: 'none',
  userSelect: 'none',
});
