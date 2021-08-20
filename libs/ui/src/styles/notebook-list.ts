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

export const gridTemplateColumns = `${542 / 1064}fr ${282 / 1064}fr ${
  240 / 1064
}fr`;
