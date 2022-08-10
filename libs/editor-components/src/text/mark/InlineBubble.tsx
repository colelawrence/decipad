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
import { atoms } from '@decipad/ui';
import { getDefined } from '@decipad/utils';
import { css } from '@emotion/react';
import { useCallback } from 'react';

export const InlineBubble: PlateComponent = ({
  attributes,
  children,
  ...rest
}) => {
  const editor = useTEditorRef();
  const element = getDefined(rest?.element as BubbleElement);

  const blockId = element.id;
  const result = useResult(blockId);
  const updateValue = useElementMutatorCallback(editor, element, 'formula');

  const { setEditing } = useEditorBubblesContext();
  const openEditor = useCallback(() => {
    setEditing({
      blockId,
      updateValue,
      formula: element.formula,
    });
  }, [blockId, element.formula, setEditing, updateValue]);

  const readOnly = useIsEditorReadOnly();
  const codeResult = result?.results?.[0];
  const loadingState = !!result?.error;

  return (
    <span {...attributes} id={blockId}>
      <atoms.MagicNumber
        result={codeResult}
        readOnly={readOnly}
        loadingState={loadingState}
        onClick={openEditor}
      ></atoms.MagicNumber>

      <span contentEditable={false} css={css({ display: 'none' })}>
        {children}
      </span>
    </span>
  );
};
