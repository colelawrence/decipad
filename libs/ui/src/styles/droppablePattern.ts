import { css } from '@emotion/react';

export const droppablePatternStyles = (
  firstColor: string,
  secondColor: string
) =>
  css({
    background: `repeating-linear-gradient(
    45deg,
    ${firstColor},
    ${firstColor} 8px,
    ${secondColor} 8px,
    ${secondColor} 16px
  )`,
  });
