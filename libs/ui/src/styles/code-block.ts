import { CSSObject } from '@emotion/react';
import { code, setCssVar, grey300, cssVar } from '../primitives';

export const lineHeight = '36px';

export const variableStyles: CSSObject = {
  ...code,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  backgroundColor: grey300.rgb,
  fontWeight: 500,
  fontSize: '13px',
};
