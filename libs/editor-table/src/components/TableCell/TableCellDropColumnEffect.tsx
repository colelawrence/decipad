import { useEffect } from 'react';
import {
  useTEditorRef,
  TableHeaderElement,
  TableCellElement,
} from '@decipad/editor-types';
import { useDropColumn } from '../../hooks';
import { RefPipe } from '@decipad/react-utils';

export interface TableCellDropColumnEffectProps {
  element: TableHeaderElement | TableCellElement;
  dropTargetPipe: RefPipe<HTMLTableCellElement | null>;
}

export const TableCellDropColumnEffect = ({
  element,
  dropTargetPipe,
}: TableCellDropColumnEffectProps) => {
  const editor = useTEditorRef();
  const [, dropTargetRef] = useDropColumn(editor, element);

  useEffect(() => {
    dropTargetPipe.subscribe(dropTargetRef);

    return () => {
      dropTargetPipe.unsubscribe(dropTargetRef);
    };
  }, [dropTargetRef, dropTargetPipe]);

  return null;
};
