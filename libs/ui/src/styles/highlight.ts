import { CSSObject } from '@emotion/react';
import { setCssVar, cssVar } from '../primitives';

export const highlightStyles: CSSObject = {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  backgroundColor: cssVar('textHighlightColor'),
};
