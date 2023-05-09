import { useCallback, useMemo } from 'react';
import { setNodes } from '@udecode/plate';
import {
  LiveConnectionElement,
  LiveDataSetElement,
  TableCellType,
  useTEditorRef,
} from '@decipad/editor-types';
import { usePathMutatorCallback } from '@decipad/editor-utils';
import { Path } from 'slate';
import { ExternalDataSource } from '@decipad/interfaces';

interface UseCoreLiveConnectionActionsProps {
  path?: Path;
  element: LiveConnectionElement | LiveDataSetElement;
}

export const useCoreLiveConnectionActions = ({
  path,
  element,
}: UseCoreLiveConnectionActionsProps) => {
  const editor = useTEditorRef();

  const onChangeColumnType = useCallback(
    (columnIndex: number, type: TableCellType) => {
      if (path) {
        setNodes<LiveConnectionElement | LiveDataSetElement>(
          editor,
          {
            columnTypeCoercions: {
              ...element.columnTypeCoercions,
              [columnIndex]: type,
            },
          },
          { at: path }
        );
      }
    },
    [editor, element.columnTypeCoercions, path]
  );

  const setIsFirstRowHeader = usePathMutatorCallback(
    editor,
    path,
    'isFirstRowHeaderRow'
  );

  const beforeAuthenticate = useCallback(
    (source: ExternalDataSource) => {
      if (path) {
        setNodes(editor, { proxy: source.dataUrl }, { at: path });
      }
    },
    [editor, path]
  );

  return useMemo(
    () => ({
      onChangeColumnType,
      setIsFirstRowHeader,
      beforeAuthenticate,
    }),
    [onChangeColumnType, setIsFirstRowHeader, beforeAuthenticate]
  );
};
