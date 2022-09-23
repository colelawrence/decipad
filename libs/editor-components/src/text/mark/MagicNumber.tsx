import {
  PlateComponent,
  RichText,
  useTEditorRef,
  MyEditor,
  MyNode,
  MyElement,
} from '@decipad/editor-types';
import {
  useComputer,
  useEditorChange,
  useIsEditorReadOnly,
  useResult,
} from '@decipad/react-contexts';
import { MagicNumber as UIMagicNumber } from '@decipad/ui';
import { css } from '@emotion/react';
import { Element, Path } from 'slate';
import { findNodePath, getNode, getNodeString } from '@udecode/plate';
import { useState } from 'react';
import { magicNumberId } from '@decipad/editor-utils';
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

  return (
    <span {...attributes}>
      <UIMagicNumber
        loadingState={loadingState}
        result={result}
        expression={exp}
        onClick={() => {
          // if it's a variable name, we can navigate to it.
          if (typeof defBlockId === 'string') {
            const el = document.getElementById(defBlockId);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el?.focus();
          }
        }}
        readOnly={readOnly}
      ></UIMagicNumber>
      <span contentEditable={false} css={css({ display: 'none' })}>
        {children}
      </span>
    </span>
  );
};

function myGetNode(editor: MyEditor, path: Path): MyNode | null {
  let node: MyNode | null = null;
  try {
    node = getNode<MyNode>(editor, path);
  } catch (err) {
    // do nothing
  }
  return node;
}

/** Get the ID of the magic number, comprised of paragraph and index */
function useMagicNumberId(text: RichText) {
  const editor = useTEditorRef();
  const [magicNumberBlockId, setMagicNumberBlockId] = useState<string>('');

  useEditorChange(setMagicNumberBlockId, (): string => {
    const path = findNodePath(editor, text);

    if (!path) return '';

    let pathOfElement = path;
    while (pathOfElement.length) {
      const node = myGetNode(editor, pathOfElement);
      if (Element.isElement(node)) {
        break;
      }
      pathOfElement = Path.parent(pathOfElement);
    }
    const element = myGetNode(editor, pathOfElement);

    if (element) {
      return magicNumberId(element as MyElement, path[path.length - 1]);
    }
    return '';
  });

  return magicNumberBlockId;
}
