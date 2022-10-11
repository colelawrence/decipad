import { FC, ReactNode } from 'react';
import { PlateComponentAttributes } from '@decipad/editor-types';

export interface DataViewColumnHeaderRowProps {
  attributes?: PlateComponentAttributes;
  children?: ReactNode;
  isCollapsed?: boolean;
}

export const DataViewColumnHeaderRow = ({
  attributes,
  children,
}: DataViewColumnHeaderRowProps): ReturnType<FC> => {
  return (
    <tr {...attributes} contentEditable={false}>
      {children}
    </tr>
  );
};
