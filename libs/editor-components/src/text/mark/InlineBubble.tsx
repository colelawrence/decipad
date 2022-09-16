import { useCallback, useEffect } from 'react';
import { css } from '@emotion/react';
import {
  BubbleElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import {
  useEditorBubblesContext,
  useIsEditorReadOnly,
  useResult,
} from '@decipad/react-contexts';
import { MagicNumber } from '@decipad/ui';
import { getDefined } from '@decipad/utils';
import { findNodePath, focusEditor, removeNodes } from '@udecode/plate';

export const InlineBubble: PlateComponent = ({
  attributes,
  children,
  ...rest
}) => {
  const element = getDefined(rest?.element as BubbleElement);

  const blockId = element.id;
  const result = useResult(blockId);

  const readOnly = useIsEditorReadOnly();
  const codeResult = result?.result;
  const loadingState = !!result?.error;

  const { openEditor } = useOpenCloseEditor(element);

  return (
    <span {...attributes} id={blockId}>
      <MagicNumber
        result={codeResult}
        readOnly={readOnly}
        loadingState={loadingState}
        onClick={openEditor}
      ></MagicNumber>

      <span contentEditable={false} css={css({ display: 'none' })}>
        {children}
      </span>
    </span>
  );
};

const useOpenCloseEditor = (element: BubbleElement) => {
  const editor = useTEditorRef();
  const blockId = element.id;
  const updateOpened = useElementMutatorCallback(editor, element, 'opened');
  const updateValue = useElementMutatorCallback(editor, element, 'formula');

  const { setEditing } = useEditorBubblesContext();
  const openEditor = useCallback(() => {
    const deleteBubble = () => {
      const path = findNodePath(editor, element);
      if (!path) return;

      focusEditor(editor);
      removeNodes(editor, { at: path });
    };
    setEditing({
      blockId,
      updateValue,
      deleteBubble,
      formula: element.formula,
    });
  }, [editor, blockId, element, setEditing, updateValue]);

  useEffect(
    function onOpened() {
      if (!element.opened) return;

      openEditor();
      updateOpened(false);
    },
    [element.opened, updateOpened, openEditor]
  );

  useEffect(
    function onDelete() {
      return () => setEditing(undefined);
    },
    [setEditing]
  );

  return { openEditor };
};
