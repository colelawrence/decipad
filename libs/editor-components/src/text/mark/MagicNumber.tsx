import { PlateComponent, RichText, MyElement } from '@decipad/editor-types';
import {
  useComputer,
  useEditorSelector,
  useIsEditorReadOnly,
  useResult,
} from '@decipad/react-contexts';
import { MagicNumber as UIMagicNumber } from '@decipad/ui';
import { css } from '@emotion/react';
import { Element } from 'slate';
import { findNodePath, getNodeString } from '@udecode/plate';
import { useCallback } from 'react';
import { magicNumberId, getAboveNodeSafe } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';

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

  const loadingState =
    result?.type?.kind === 'type-error' ||
    (result?.type?.kind === 'number' && result?.type?.unit?.[0].unit === exp);

  const defBlockId = computer.getVarBlockId$.use(exp);

  const onClick = useCallback(() => {
    // if it's a variable name, we can navigate to it.
    if (typeof defBlockId === 'string') {
      const el = document.getElementById(defBlockId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
    }
  }, [defBlockId]);

  return (
    <span {...attributes}>
      <UIMagicNumber
        loadingState={loadingState}
        result={result}
        expression={exp}
        onClick={onClick}
        readOnly={readOnly}
      ></UIMagicNumber>
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
