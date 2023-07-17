import { useEffect } from 'react';
import {
  useTEditorRef,
  TableHeaderElement,
  TableCellElement,
} from '@decipad/editor-types';
import { useDropColumn } from '../../hooks';

export interface TableCellDropColumnEffectProps {
  element: TableHeaderElement | TableCellElement;
  dropTarget: HTMLTableCellElement | null;
}

export const TableCellDropColumnEffect = ({
  element,
  dropTarget,
}: TableCellDropColumnEffectProps) => {
  const editor = useTEditorRef();
  const [, dropTargetRef] = useDropColumn(editor, element);

  useEffect(() => {
    dropTargetRef(dropTarget);
  }, [dropTarget, dropTargetRef]);

  return null;
};
