import { CSSObject, css } from '@emotion/react';
import { cssVar } from '../primitives';

export const resultBubbleStyles: CSSObject = {
  ':empty': { display: 'none' },
  borderRadius: 8,
  backgroundColor: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
  filter: `drop-shadow(0px 1px 0px ${cssVar('borderSubdued')})`,
  '@media print': {
    backgroundColor: 'unset',
    border: 'unset',
    filter: 'unset',
  },
};

export const characterLimitStyles = css({
  display: 'inline-block',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  fontFeatureSettings: '"tnum"',
  verticalAlign: 'middle',
  lineHeight: 1.2,
});

export const resultLoadingIconStyles = css({
  paddingTop: '3px',
  minHeight: '19px',
  display: 'inline-block',
  margin: 'auto',
  '> svg': { height: '16px', display: 'block', margin: '0 auto' },
});
