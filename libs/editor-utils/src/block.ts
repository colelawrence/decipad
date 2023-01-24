import { Computer } from '@decipad/computer';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_IMAGE,
  ELEMENT_INLINE_NUMBER,
  ELEMENT_LIC,
  ELEMENT_PARAGRAPH,
  ElementKind,
  InlineNumberElement,
  MyEditor,
  MyElement,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_STRUCTURED_IN_CHILD,
  ELEMENT_STRUCTURED_VARNAME,
  StructuredInputElement,
} from '@decipad/editor-types';
import {
  getEndPoint,
  getNextNode,
  getNode,
  getStartPoint,
  setSelection,
  TDescendant,
  TElement,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import { insertNodes } from './insertNodes';
import {
  getBlockParentPath,
  getNonTextParentPath,
  requirePathBelowBlock,
} from './path';
import { getPathContainingSelection } from './selection';

export const closestBlockAncestorHasType = (
  editor: MyEditor,
  path: Path,
  type: ElementKind
): boolean => {
  const blockParentPath = getBlockParentPath(editor, path);
  if (!blockParentPath) {
    return false;
  }

  const block = getNode<MyElement>(editor, blockParentPath);
  if (!block) {
    throw new Error('Cannot find node at the block path');
  }
  return block.type === type;
};

export const closestElementAncestorHasType = (
  editor: MyEditor,
  path: Path,
  type: ElementKind
) => {
  const elementParentPath = getNonTextParentPath(editor, path);
  if (!elementParentPath) {
    return false;
  }

  const block = getNode<MyElement>(editor, elementParentPath);
  if (!block) {
    throw new Error('Cannot find node at the block path');
  }

  return block.type === type;
};

const BLOCKS_ALLOWING_TEXT_STYLING: ReadonlyArray<ElementKind> = [
  ELEMENT_PARAGRAPH,
  ELEMENT_LIC,
  ELEMENT_BLOCKQUOTE,
];

export const allowsTextStyling = (
  editor: MyEditor,
  path: Path | null
): boolean => {
  return path
    ? BLOCKS_ALLOWING_TEXT_STYLING.some((type) =>
        closestBlockAncestorHasType(editor, path, type)
      )
    : false;
};

export const selectionIsNotBubble = (editor: MyEditor): boolean => {
  const path = getPathContainingSelection(editor);
  return path
    ? !closestElementAncestorHasType(editor, path, ELEMENT_INLINE_NUMBER)
    : false;
};

export const getSelectionBubble = (
  editor: MyEditor
): InlineNumberElement | null => {
  const path = getPathContainingSelection(editor);
  if (!path) return null;

  const blockParentPath = getNonTextParentPath(editor, path);
  if (!blockParentPath) return null;

  const element = getNode<MyElement>(editor, blockParentPath);

  if (element == null) return null;
  if (element.type !== ELEMENT_INLINE_NUMBER) return null;

  return element as InlineNumberElement;
};

export const insertDividerBelow = (
  editor: MyEditor,
  path: Path,
  type: ElementKind
): void => {
  const at = requirePathBelowBlock(editor, path);
  insertNodes<TElement>(
    editor,
    { id: nanoid(), type, children: [{ text: '' }] },
    { at }
  );

  const next = getNextNode(editor, { at });
  if (next) {
    const [, nextPath] = next;
    const end = getEndPoint(editor, nextPath);
    setSelection(editor, { anchor: end, focus: end });
  }
};

export const insertBlockOfTypeBelow = (
  editor: MyEditor,
  path: Path,
  type: ElementKind
): void => {
  insertNodes<TElement>(
    editor,
    { id: nanoid(), type, children: [{ text: '' }] },
    { at: requirePathBelowBlock(editor, path) }
  );
};

export const insertStructuredInput = (
  editor: MyEditor,
  path: Path,
  getAvailableIdentifier: Computer['getAvailableIdentifier']
): void => {
  const insertPath = requirePathBelowBlock(editor, path);
  insertNodes<TElement>(
    editor,
    {
      id: nanoid(),
      type: ELEMENT_STRUCTURED_IN,
      children: [
        {
          type: ELEMENT_STRUCTURED_VARNAME,
          id: nanoid(),
          children: [{ text: getAvailableIdentifier('Name', 1) }],
        },
        {
          type: ELEMENT_STRUCTURED_IN_CHILD,
          id: nanoid(),
          children: [{ text: '100' }],
        },
      ],
    } as StructuredInputElement,
    { at: insertPath }
  );
  const valuePath = [...insertPath, 1];
  const valueEnd = getEndPoint(editor, valuePath);
  const valueStart = getStartPoint(editor, valuePath);
  setSelection(editor, { anchor: valueStart, focus: valueEnd });
};

export const insertImageBelow = (
  editor: MyEditor,
  path: Path,
  url: string,
  alt = ''
): void => {
  insertNodes<TElement>(
    editor,
    {
      id: nanoid(),
      type: ELEMENT_IMAGE,
      children: [{ text: alt } as TDescendant],
      url,
    },
    { at: requirePathBelowBlock(editor, path) }
  );
};
