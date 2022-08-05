import {
  PlateComponent,
  RichText,
  useTEditorRef,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import {
  useComputer,
  useIsEditorReadOnly,
  useResult,
} from '@decipad/react-contexts';
import { atoms } from '@decipad/ui';
import { css } from '@emotion/react';
import { Node } from 'slate';
import { findNodePath } from '@udecode/plate';
import { useEffect, useState } from 'react';
import { useObservable } from 'rxjs-hooks';
import { isElementOfType, magicNumberId } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';

export const MagicNumber: PlateComponent = ({ attributes, text, children }) => {
  const computer = useComputer();
  const exp = text?.text ?? '';

  const blockId = useMagicNumberId(getDefined(text));

  const result = useResult(blockId)?.results[0];

  const loadingState =
    result?.type?.kind === 'type-error' ||
    (result?.type?.kind === 'number' &&
      result?.type?.unit?.args[0].unit === exp);

  const readOnly = useIsEditorReadOnly();

  const defBlockId = useObservable(() => computer.getBlockId$(exp));

  return (
    <span {...attributes}>
      <atoms.MagicNumber
        loadingState={loadingState}
        result={result}
        onClick={() => {
          // if it's a variable name, we can navigate to it.
          if (typeof defBlockId === 'string') {
            const el = document.getElementById(defBlockId);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el?.focus();
          }
        }}
        readOnly={readOnly}
      ></atoms.MagicNumber>
      <span contentEditable={false} css={css({ display: 'none' })}>
        {children}
      </span>
    </span>
  );
};

/** Get the ID of the magic number, comprised of paragraph and index */
function useMagicNumberId(text: RichText) {
  const editor = useTEditorRef();
  const [magicNumberBlockId, setMagicNumberBlockId] = useState<string>('');

  useEffect(() => {
    const blockId = (() => {
      const path = findNodePath(editor, text);

      if (!path) return '';

      const pathOfParagraph = path.slice(0, -1);

      const paragraph = (() => {
        try {
          return Node.get(editor, pathOfParagraph);
        } catch {
          return null;
        }
      })();

      if (paragraph && isElementOfType(paragraph, ELEMENT_PARAGRAPH)) {
        return magicNumberId(paragraph, path[path.length - 1]);
      }
      return '';
    })();

    setMagicNumberBlockId(blockId);
  }, [editor, text]);

  return magicNumberBlockId;
}
