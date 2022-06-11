import { SerializedType } from '@decipad/computer';
import { css, CSSObject } from '@emotion/react';
import { isTabularType } from '../utils';

export const buttonColumnWidth = '44px';

export const tableControlWidth = '20px';

export const thMinHeight = '32px';
export const thMinWidth = '269px';
export const tdMinHeight = '36px';
export const firstTdLeftPadding = '20px';

export const cellSidePadding = '12px';
export const cellLineHeight = '35px';

export const cellSidePaddingStyles = css({
  padding: `0 ${cellSidePadding}`,
});

export const cellLeftPaddingStyles = css({
  paddingLeft: cellSidePadding,
  paddingRight: cellSidePadding,
});

export const getCellWrapperStyles = (type: SerializedType): CSSObject => ({
  overflowX: 'hidden',
  display: 'grid',
  padding: isTabularType(type) ? undefined : `0 ${cellSidePadding}`,
});

export const rowTemplate = (
  numberOfColumns: number,
  readOnly: boolean
): string =>
  `auto / ${tableControlWidth} repeat(${numberOfColumns}, 1fr) ${
    readOnly ? '' : buttonColumnWidth
  }`;
