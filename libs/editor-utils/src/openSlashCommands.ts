import { ELEMENT_PARAGRAPH, MyEditor, MyElement } from '@decipad/editor-types';
import {
  findNodePath,
  focusEditor,
  getEndPoint,
  getNextNode,
  getNodeString,
  insertNodes,
  insertText,
  nanoid,
  select,
} from '@udecode/plate-common';

export const openSlashMenu = (editor: MyEditor, element: MyElement) => {
  const currentLine = getNodeString(element);

  let currentPath = findNodePath(editor, element);
  if (!currentPath) return;

  const nextNode = getNextNode(editor, { at: currentPath.slice(0, 1) });
  const [nextElement, nextPath] = nextNode || [];
  if (currentLine === '/') return;

  const slashAlreadyCreated =
    currentLine !== '' && nextElement && getNodeString(nextElement) === '/';

  if (slashAlreadyCreated && nextPath) {
    select(editor, getEndPoint(editor, nextPath));
    focusEditor(editor);
    return;
  }

  const isParagraph = element.type === ELEMENT_PARAGRAPH;
  const createNewParagraph = currentLine || !isParagraph;

  if (createNewParagraph && nextPath) {
    insertNodes(
      editor,
      [
        {
          id: nanoid(),
          type: ELEMENT_PARAGRAPH,
          children: [{ text: '/' }],
        },
      ],
      {
        at: nextPath,
      }
    );
    select(editor, getEndPoint(editor, nextPath));
    focusEditor(editor);
  } else {
    if (currentLine && currentPath.length > 0) {
      currentPath = [currentPath[0] + 1];
    }
    insertText(editor, '/', { at: currentPath });
    select(editor, getEndPoint(editor, currentPath));
    focusEditor(editor);
  }
};
