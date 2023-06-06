import { css, CSSObject } from '@emotion/react';
import { code, cssVar, p14Regular, setCssVar } from '../primitives';

export const lineHeight = '36px';

export const variableStyles: CSSObject = {
  ...code,
  ...setCssVar('currentTextColor', cssVar('variableHighlightTextColor')),
  backgroundColor: cssVar('variableHighlightColor'),
  fontWeight: 500,
  fontSize: '13px',
};

export const varStyles = css(variableStyles, {
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '13px',
  maxWidth: 'min(30vw, 174px)',
  '@media print': {
    background: 'unset',
    color: cssVar('normalTextColor'),
  },
});

export const structuredVariableStyles: CSSObject = {
  ...p14Regular,
};

export const pAdvCalcStyles = css(structuredVariableStyles, {
  padding: '4px 8px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  width: 'fit-content',
});

export const pIconStyles = css({
  display: 'inline-flex',
  verticalAlign: 'text-top',
  height: '16px',
  width: '16px',
  marginRight: '4px',
  pointerEvents: 'none',
  userSelect: 'none',
});
