import { CSSObject } from '@emotion/react';
import { cssVar } from '../primitives';

export const styles: CSSObject = {
  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('highlightColor')}`,
  borderRadius: '8px',
};
