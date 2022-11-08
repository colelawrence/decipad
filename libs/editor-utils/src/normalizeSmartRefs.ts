import { Computer, getUsedIdentifiers, tokenize } from '@decipad/computer';
import {
  ELEMENT_SMART_REF,
  MyEditor,
  MyNode,
  SmartRefElement,
} from '@decipad/editor-types';
import {
  getNextNode,
  getNodeString,
  insertNodes,
  insertText,
  isElement,
  removeNodes,
  setSelection,
  withoutNormalizing,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Location, Path, Point, Range } from 'slate';

export const normalizeSmartRefs = (
  node: MyNode,
  path: Path,
  editor: MyEditor,
  computer: Computer
) => {
  const names = computer
    .getNamesDefined()
    .filter((n) => n.kind === 'variable')
    .map((n) => [n.name, n.blockId]);
  const namesToIds: { [name: string]: string } = Object.fromEntries(names);
  const idsToNames: { [blockId: string]: string } = Object.fromEntries(
    names.map((n) => [n[1], n[0]])
  );

  // text
  if (!isElement(node)) {
    return handleTextNode(node, path, editor, namesToIds);
  }
  // smart ref
  if (node.type === ELEMENT_SMART_REF) {
    return handleSmartRefNode(node, path, editor, idsToNames);
  }

  return false;
};

const handleSmartRefNode = (
  node: SmartRefElement,
  path: Path,
  editor: MyEditor,
  idsToNames: { [blockId: string]: string }
) => {
  const curName = idsToNames[node.blockId];
  if (!curName) {
    return false;
  }

  const nextEntry = getNextNode(editor, { at: path });
  if (nextEntry) {
    const [nextNode, nextPath] = nextEntry;
    const nextNodeStr = getNodeString(nextNode);
    const nextTokens = tokenize(nextNodeStr).filter((t) => t?.type !== 'ws');

    // turn smart ref into text if it's in the LHS of a declaration
    if (nextTokens[0]?.type === 'equalSign') {
      withoutNormalizing(editor, () => {
        insertText(editor, curName, {
          at: { path: nextPath, offset: 0 },
        });
        removeNodes(editor, { at: path });
      });
      return true;
    }
  }
  return false;
};
const handleTextNode = (
  node: MyNode,
  path: Path,
  editor: MyEditor,
  namesToIds: { [name: string]: string }
) => {
  const fullStr = getNodeString(node);
  const allTokens = tokenize(fullStr).filter((t) => t?.type !== 'ws');
  const tokenPositions = Object.fromEntries(
    allTokens.map((t, i) => [t.offset, i])
  );
  const identifs = getUsedIdentifiers(fullStr);

  for (const token of identifs) {
    const tPos = tokenPositions[token.start];
    // don't turn token in the LHS of a declaration into smart ref
    if (allTokens[tPos + 1]?.type === 'equalSign') {
      continue;
    }
    // don't turn column name in table.column into a smart ref
    if (allTokens[tPos - 1]?.type === 'dot') {
      continue;
    }
    if (!token.isDeclaration) {
      const blockId = namesToIds[token.text];
      if (blockId) {
        const start = { path, offset: token.start };
        const end = { path, offset: token.end };
        const textRange = { anchor: start, focus: end };
        const inside =
          editor.selection && !!Range.intersection(editor.selection, textRange);

        // dont replace if selection is inside or right next to the var name
        if (inside) {
          return false;
        }
        replaceTextWithSmartRef(editor, textRange, blockId);
        return true;
      }
    }
  }
  return false;
};

export const smartRefToText = (
  editor: MyEditor,
  smartRefLocation: Location,
  text: string,
  textPoint: Point
) => {
  removeNodes(editor, { at: smartRefLocation });
  insertText(editor, text, {
    at: textPoint,
  });
  setSelection(editor, { anchor: textPoint, focus: textPoint });
};

const replaceTextWithSmartRef = (
  editor: MyEditor,
  textRange: Range,
  blockId: string
) => {
  const smartRef: SmartRefElement = {
    id: nanoid(),
    type: ELEMENT_SMART_REF,
    blockId,
    children: [{ text: '' }],
  };
  insertNodes(editor, [{ text: '' }, smartRef, { text: '' }], {
    at: textRange,
  });
};
