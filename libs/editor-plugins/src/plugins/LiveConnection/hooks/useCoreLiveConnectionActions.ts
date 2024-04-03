import { useCallback, useMemo } from 'react';
import { setNodes } from '@udecode/plate-common';
import {
  LiveConnectionElement,
  LiveDataSetElement,
  TableCellType,
  useMyEditorRef,
} from '@decipad/editor-types';
import { usePathMutatorCallback } from '@decipad/editor-hooks';
import { Path } from 'slate';
import { ExternalDataSourceFragmentFragment } from '@decipad/graphql-client';

interface UseCoreLiveConnectionActionsProps {
  path?: Path;
  element?: LiveConnectionElement | LiveDataSetElement;
}

export const useCoreLiveConnectionActions = ({
  path,
  element,
}: UseCoreLiveConnectionActionsProps) => {
  const editor = useMyEditorRef();

  const onChangeColumnType = useCallback(
    (columnIndex: number, type?: TableCellType) => {
      if (path) {
        setNodes<LiveConnectionElement | LiveDataSetElement>(
          editor,
          {
            columnTypeCoercions: {
              ...element?.columnTypeCoercions,
              [columnIndex]: type,
            },
          },
          { at: path }
        );
      }
    },
    [editor, element?.columnTypeCoercions, path]
  );

  const setIsFirstRowHeader = usePathMutatorCallback<
    LiveConnectionElement | LiveDataSetElement
  >(editor, path, 'isFirstRowHeaderRow', 'useCoreLiveConnectionActions');

  const beforeAuthenticate = useCallback(
    (source: ExternalDataSourceFragmentFragment) => {
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
