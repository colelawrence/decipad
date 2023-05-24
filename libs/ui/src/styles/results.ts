import { CSSObject, css } from '@emotion/react';
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

export const characterLimitStyles = css({
  display: 'block',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  fontFeatureSettings: '"tnum"',
});

export const resultLoadingIconStyles = css({
  paddingTop: '3px',
  minHeight: '19px',
  display: 'inline-block',
  margin: 'auto',
  '> svg': { height: '16px', display: 'block', margin: '0 auto' },
});
