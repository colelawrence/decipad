import { once } from '@decipad/utils';
import { css } from '@emotion/react';
import { DragHandle } from '../icons';
import { cssVar, p14Regular } from '../primitives';
import { getSvgAspectRatio } from '../utils';

export const slimBlockWidth = 620;
export const wideBlockWidth = 700;

export const gutterHandleHeight = once(() => p14Regular.lineHeight);
export const gutterHandleWidth = once(
  () => `calc(${getSvgAspectRatio(<DragHandle />)} * ${gutterHandleHeight()})`
);

export const gutterGap = 16;
// TODO when implementing the editor page,
// make sure to include this in the side padding (plus any non-negative further gutter)
export const gutterWidth = once(
  () => `calc(${gutterHandleWidth()} + ${gutterGap}px)`
);

export const hideOnPrint = css({
  '@media print': {
    display: 'none',
  },
});

export const integrationBlockStyles = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const fullWidthLayout = css({
  position: 'relative',
  marginLeft: '-30px',
  paddingLeft: '30px',
  transition: '0.2s ease-out',
  paddingTop: 'calc(1.5rem)',
  transform: `translateX(min(
    60px -
    (
      var(--deci-editorWidth, 100vw) -
      620px
    ) / 2,
    0px
  ))`,
  minWidth: `calc(
    ${cssVar('editorWidth')} -
    90px
  )`,
});
