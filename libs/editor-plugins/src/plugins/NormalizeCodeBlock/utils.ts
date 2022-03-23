import { CodeLineElement } from '@decipad/editor-types';
import { Editor, Node, Path, Selection, Transforms } from 'slate';

export function getCodeLineText(node: CodeLineElement): string {
  return Node.string(node);
}

export function incrementLastElementOfPath(path: Path): Path {
  return [...path.slice(0, path.length - 1), path[path.length - 1] + 1];
}

export function clonePath(path: Path): Path {
  return Array.from(path);
}

export function cloneSelection(sel: Selection): Selection {
  if (!sel) {
    return sel;
  }
  return {
    anchor: {
      path: clonePath(sel.anchor.path),
      offset: sel.anchor.offset,
    },
    focus: {
      path: clonePath(sel.focus.path),
      offset: sel.focus.offset,
    },
  };
}

export function setSelection(editor: Editor, sel: Selection): void {
  if (sel && Node.has(editor, sel.anchor.path)) {
    Transforms.setSelection(editor, sel);
  }
}
