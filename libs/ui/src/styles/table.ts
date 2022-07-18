import { SerializedType } from '@decipad/computer';
import { css, CSSObject } from '@emotion/react';
import { isTabularType } from '../utils';

export const buttonColumnWidth = '44px';

export const tableControlWidth = '20px';

export const thMinHeight = '32px';
export const thMinWidth = '269px';
export const tdMinHeight = '36px';
export const tdMinWidth = '120px';
export const tdMaxWidth = '240px';

export const firstTdLeftPadding = '20px';

export const cellSidePadding = '12px';

export const cellSidePaddingStyles = css({
  padding: `0 ${cellSidePadding}`,
});

export const cellLeftPaddingStyles = css({
  paddingLeft: cellSidePadding,
  paddingRight: cellSidePadding,
});

export const tableParentStyles = css({
  padding: 0,
  overflow: 'hidden',
  table: {
    width: '100%',
  },
});

export const getCellWrapperStyles = (type: SerializedType): CSSObject => ({
  padding: isTabularType(type) ? undefined : `0 ${cellSidePadding}`,
});
