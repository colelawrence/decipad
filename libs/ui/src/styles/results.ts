import { CSSObject } from '@emotion/react';
import { cssVar } from '../primitives';

export const resultBubbleStyles: CSSObject = {
  ':empty': { display: 'none' },
  borderRadius: 8,
  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('borderColor')}`,
  filter: `drop-shadow(0px 1px 0px ${cssVar('borderColor')})`,
  '@media print': {
    backgroundColor: 'unset',
    border: 'unset',
    filter: 'unset',
  },
};
