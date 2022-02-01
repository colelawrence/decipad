import { SerializedType } from '@decipad/language';
import { css, CSSObject } from '@emotion/react';
import { isTabularType } from '../utils';

export const buttonColumnWidth = '44px';

export const thMinHeight = '32px';
export const tdMinHeight = '36px';

export const cellSidePadding = '12px';

export const cellSidePaddingStyles = css({
  padding: `0 ${cellSidePadding}`,
});

export const cellLeftPaddingStyles = css({
  paddingLeft: cellSidePadding,
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
  `auto / repeat(${numberOfColumns}, 1fr) ${readOnly ? '' : buttonColumnWidth}`;
