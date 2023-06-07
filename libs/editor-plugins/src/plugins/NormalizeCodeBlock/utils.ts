import { CodeLineElement } from '@decipad/editor-types';
import { Path, Selection } from 'slate';
import { getNodeString } from '@udecode/plate';

export function getCodeLineText(node: CodeLineElement): string {
  return getNodeString(node);
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
