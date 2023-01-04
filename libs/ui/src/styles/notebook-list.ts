import { CSSObject } from '@emotion/react';
import { smallestDesktop, smallestMobile } from '../primitives';
import { viewportCalc } from '../utils';

export const horizontalPadding = viewportCalc(
  smallestMobile,
  20,
  smallestDesktop,
  28,
  'px',
  'vw'
);
export const verticalPadding = '26px';

export const gridStyles: CSSObject = {
  width: '100%',
  display: 'grid',
  gridTemplateColumns:
    '[icon] 42px [title] min-content [tags] 1fr [actions] 28px',
  alignItems: 'center',
};
