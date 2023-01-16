import { CSSObject, css } from '@emotion/react';
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
  padding: '4px 6px',
  borderRadius: '6px',
  fontSize: '13px',
});

export const structuredVariableStyles: CSSObject = {
  ...p14Regular,
};
