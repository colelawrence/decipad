import { CSSObject } from '@emotion/react';
import { code, setCssVar, cssVar, p14Regular } from '../primitives';

export const lineHeight = '36px';

export const variableStyles: CSSObject = {
  ...code,
  ...setCssVar('currentTextColor', cssVar('variableHighlightTextColor')),
  backgroundColor: cssVar('variableHighlightColor'),
  fontWeight: 500,
  fontSize: '13px',
};

export const structuredVariableStyles: CSSObject = {
  ...p14Regular,
};
