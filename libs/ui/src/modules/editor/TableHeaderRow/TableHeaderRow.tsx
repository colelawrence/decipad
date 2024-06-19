/* eslint decipad/css-prop-named-variable: 0 */
import { PlateComponentAttributes, TableCellType } from '@decipad/editor-types';
import { FC, ReactNode } from 'react';

interface TableHeaderRowProps {
  readonly children: ReactNode;
  readonly readOnly?: boolean;
  readonly attributes?: PlateComponentAttributes;

  readonly onChangeColumnType?: (type: TableCellType) => void;
}

//
// So what is going on here...
//
// It seems that we add an empty <th> element and adjust throughout
// the table element :(((
//
// This causes so many weird things with styles, but its everywhere,
// so will take a few hours to fix this spaghetti.
//
// look for `tableControlWidth`. The styles for table need fixing asap.
//

export const TableHeaderRow = ({
  children,
  readOnly = false,
  attributes,
}: TableHeaderRowProps): ReturnType<FC> => {
  return (
    <tr {...attributes}>
      {!readOnly && (
        <th
          contentEditable={false}
          css={{
            width: 0,
            border: 'none !important',
          }}
        />
      )}
      {children}
    </tr>
  );
};
