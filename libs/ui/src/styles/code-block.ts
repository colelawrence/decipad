import { CSSObject } from '@emotion/react';
import { code, setCssVar, cssVar } from '../primitives';

export const lineHeight = '36px';

export const variableStyles: CSSObject = {
  ...code,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  backgroundColor: cssVar('strongerHighlightColor'),
  fontWeight: 500,
  fontSize: '13px',
};
