import { once } from 'ramda';
import { p14Regular } from '../primitives';
import { DragHandle } from '../icons';
import { getSvgAspectRatio } from '../utils';

export const slimBlockWidth = 580;
export const wideBlockWidth = 700;

export const gutterHandleHeight = once(
  () => `calc(${p14Regular.lineHeight} * ${p14Regular.fontSize})`
);
export const gutterHandleWidth = once(
  () => `calc(${getSvgAspectRatio(<DragHandle />)} * ${gutterHandleHeight()})`
);

export const gutterGap = 16;
// TODO when implementing the editor page,
// make sure to include this in the side padding (plus any non-negative further gutter)
export const gutterWidth = once(
  () => `calc(${gutterHandleWidth()} + ${gutterGap}px)`
);
