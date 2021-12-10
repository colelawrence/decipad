import { smallestMobile, smallestDesktop } from '../primitives';
import { viewportCalc } from '../utils';

export const topPadding = viewportCalc(
  smallestMobile,
  12,
  smallestDesktop,
  16,
  'px',
  'vmax'
);
