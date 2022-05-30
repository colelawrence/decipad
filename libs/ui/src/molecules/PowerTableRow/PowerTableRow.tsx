import { FC, ReactNode } from 'react';
import { PlateComponentAttributes } from '@decipad/editor-types';

interface TableRowProps {
  readonly attributes?: PlateComponentAttributes;
  readonly children?: ReactNode;
}

export const PowerTableRow = ({
  attributes,
  children,
}: TableRowProps): ReturnType<FC> => {
  return <tr {...attributes}>{children}</tr>;
};
