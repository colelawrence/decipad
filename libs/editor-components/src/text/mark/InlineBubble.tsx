import {
  BubbleElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { useEditorBubblesContext, useResult } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { useCallback } from 'react';
import { brand700, organisms } from '@decipad/ui';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';

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

  const codeResult = result?.results?.[0];

  return (
    <span {...attributes} id={blockId}>
      <span
        css={{ color: brand700.rgb, fontWeight: 500, cursor: 'pointer' }}
        onClick={openEditor}
      >
        {codeResult && (
          <organisms.CodeResult variant="inline" {...codeResult} />
        )}
      </span>

      <span contentEditable={false} css={css({ display: 'none' })}>
        {children}
      </span>
    </span>
  );
};
