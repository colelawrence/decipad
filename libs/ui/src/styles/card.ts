import { CSSObject } from '@emotion/react';
import { cssVar } from '../primitives';

export const styles: CSSObject = {
  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
};
