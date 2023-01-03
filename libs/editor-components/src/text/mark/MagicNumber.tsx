import { MyElement, PlateComponent, RichText } from '@decipad/editor-types';
import {
  useComputer,
  useEditorSelector,
  useIsEditorReadOnly,
  useResult,
  useShadowCodeLine,
} from '@decipad/react-contexts';
import { MagicNumber as UIMagicNumber } from '@decipad/ui';
import { css } from '@emotion/react';
import { Element } from 'slate';
import { findNodePath, getNodeString } from '@udecode/plate';
import { useCallback } from 'react';
import { getAboveNodeSafe, magicNumberId } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import { isFlagEnabled } from '@decipad/feature-flags';

export const MagicNumber: PlateComponent = ({
  attributes,
  text: _text,
  children,
}) => {
  const computer = useComputer();
  const readOnly = useIsEditorReadOnly();
  const text = getDefined(_text);
  const exp = getNodeString(text);

  const blockId = useMagicNumberId(text);
  const result = useResult(blockId)?.result;
  const shadow = useShadowCodeLine(blockId);

  const loadingState =
    result?.type?.kind === 'type-error' ||
    (result?.type?.kind === 'number' && result?.type?.unit?.[0].unit === exp);

  const { editSource } = shadow;

  const onClick = useCallback(() => {
    const defBlockId = computer.getVarBlockId$.get(exp);

    if (typeof defBlockId !== 'string') return;

    if (isFlagEnabled('SHADOW_CODE_LINES')) {
      editSource(defBlockId, text);
    } else {
      const el = document.getElementById(defBlockId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
    }
  }, [computer, exp, text, editSource]);

  return (
    <span {...attributes}>
      <span ref={shadow.numberRef}>
        <UIMagicNumber
          tempId={blockId}
          loadingState={loadingState}
          result={result}
          expression={exp}
          onClick={onClick}
          readOnly={readOnly}
        />
        {shadow.portal}
      </span>
      <span contentEditable={false} css={css({ display: 'none' })}>
        {children}
      </span>
    </span>
  );
};

/** Get the ID of the magic number, comprised of paragraph and index */
function useMagicNumberId(text: RichText) {
  return useEditorSelector((editor) => {
    const path = findNodePath(editor, text);

    if (!path) return '';

    const entry = getAboveNodeSafe(editor, {
      at: path,
      match: (node) => Element.isElement(node),
    });

    if (!entry) return '';

    return magicNumberId(entry[0] as MyElement, path[path.length - 1]);
  });
}
