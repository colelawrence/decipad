import { PlateComponentAttributes } from '@decipad/editor-types';
import { FC, ReactNode } from 'react';
import { tableControlWidth } from '../../styles/table';

interface TableHeaderRowProps {
  readonly children: ReactNode;
  readonly readOnly?: boolean;
  readonly attributes?: PlateComponentAttributes;
}

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
            width: tableControlWidth,
            border: 'none !important',
          }}
        />
      )}
      {children}
    </tr>
  );
};
