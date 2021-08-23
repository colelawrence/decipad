import { CSSObject } from '@emotion/react';
import { smallestMobile, smallestDesktop } from '../primitives';
import { viewportCalc } from '../utils';

export const sidePadding = viewportCalc(
  smallestMobile,
  20,
  smallestDesktop,
  48,
  'px',
  'vw'
);

export const gridStyles: CSSObject = {
  width: '100%',
  display: 'grid',
  gridTemplate: `
    "icon title       updated emptycol actions" 1fr
    "icon description updated emptycol actions" 1fr
    /32px 506fr       282fr   240fr    28px
  `,
  alignItems: 'center',
  rowGap: '8px',
  columnGap: '14px',
};
