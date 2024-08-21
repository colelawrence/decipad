import { useComputer, useEditorChange } from '@decipad/editor-hooks';
import type {
  AnyElement,
  PlateComponent,
  RichText,
} from '@decipad/editor-types';
import { getAboveNodeSafe, magicNumberId } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { CodeError, MagicNumber as UIMagicNumber } from '@decipad/ui';
import { getDefined } from '@decipad/utils';
import { css } from '@emotion/react';
import { findNodePath, getNodeString } from '@udecode/plate-common';
import { useCallback, useState } from 'react';
import { Element } from 'slate';
import { BlockErrorBoundary } from '../../BlockErrorBoundary';
import { useNotebookWithIdState } from '@decipad/notebook-state';

const UnprotectedMagicNumber: PlateComponent = ({
  attributes,
  element,
  text: _text,
  children,
}) => {
  const computer = useComputer();
  const readOnly = useIsEditorReadOnly();
  const text = getDefined(_text);
  const exp = getNodeString(text);

  const blockId = useMagicNumberId(text);

  const setEditingVariable = useNotebookWithIdState(
    (s) => s.setEditingVariable
  );

  const result = computer.getBlockIdResult$.use(blockId)?.result;

  const [inlineExpEditorVisible, setInlineExpEditorVisible] = useState(false);

  const isLoading = !result || result?.type.kind === 'pending';
  const hasError = result?.type.kind === 'type-error';
  const userIsEditing = inlineExpEditorVisible;
  const loadingState = isLoading || (hasError && userIsEditing);

  // dont link to tables, because it makes
  // formulas not be seen `Table.Column`
  const isTableReference = !exp.includes('.');
  const sourceId = computer.getVarBlockId$.use(exp);

  const onClick = useCallback(() => {
    if (typeof sourceId !== 'string' || !isTableReference) {
      setInlineExpEditorVisible(true);
      return;
    }

    setEditingVariable(sourceId);
  }, [sourceId, isTableReference, setEditingVariable]);

  return (
    <span {...attributes}>
      <UIMagicNumber
        tempId={blockId}
        loadingState={loadingState}
        result={result}
        expression={exp}
        onClick={onClick}
        readOnly={readOnly}
        element={element as AnyElement}
        isReference={sourceId !== undefined}
      />
      <span contentEditable={false} css={displayNone}>
        {children}
      </span>
    </span>
  );
};

export const MagicNumber: PlateComponent = (props) => {
  return (
    <BlockErrorBoundary
      UserFallback={({ error }) => <CodeError message={error.message} />}
    >
      <UnprotectedMagicNumber {...props} />
    </BlockErrorBoundary>
  );
};

/** Get the ID of the magic number, comprised of paragraph and index */
function useMagicNumberId(text: RichText) {
  return useEditorChange((editor) => {
    const path = findNodePath(editor, text);
    if (!path) return '';

    const entry = getAboveNodeSafe(editor, {
      at: path,
      match: (node) => Element.isElement(node),
    });

    if (!entry) return '';

    return magicNumberId(entry[0] as AnyElement, path[path.length - 1]);
  });
}

const displayNone = css({ display: 'none' });
