import { CSSObject } from '@emotion/react';
import { cssVar, setCssVar } from '../primitives';

export const highlightStyles: CSSObject = {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
};
