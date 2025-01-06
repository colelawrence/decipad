import { css } from '@emotion/react';
import { cssVar } from '../primitives';
import { slimBlockWidth } from './editor-layout';

const editorBlockOffset = 30;
const fullWidthPadding = 60;

// editorBlockOffset contributes additional padding on the right
const fullWidthPaddingLeft = fullWidthPadding;
const fullWidthPaddingRight = fullWidthPadding - editorBlockOffset;

export const fullWidthStyles = css({
  transform: `translateX(min(
    ${fullWidthPaddingLeft}px -
    (
      ${cssVar('editorWidth')} -
      ${slimBlockWidth}px
    ) / 2,
    0px
  ))`,
  minWidth: `calc(
    ${cssVar('editorWidth')} -
    ${fullWidthPaddingLeft + fullWidthPaddingRight}px
  )`,
});
