export const buttonColumnWidth = '44px';

export const thMinHeight = '32px';
export const tdMinHeight = '36px';

export const cellSidePadding = '12px';

export const rowTemplate = (
  numberOfColumns: number,
  readOnly: boolean
): string =>
  `auto / repeat(${numberOfColumns}, 1fr) ${readOnly ? '' : buttonColumnWidth}`;
