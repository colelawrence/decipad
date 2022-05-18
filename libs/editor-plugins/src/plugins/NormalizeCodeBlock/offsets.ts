import {
  CodeBlockElement,
  CodeLineElement,
  MyEditor,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { getChildren, getNode, getNodeString, select } from '@udecode/plate';
import { Path, Point, Selection } from 'slate';
import { cloneSelection } from './utils';

interface Offsets {
  anchor: number | null;
  focus: number | null;
}

function getOffsetFromPath(editor: MyEditor, path: Path): number {
  const [codeBlockIndex] = path;
  let offset = 0;
  const codeBlock = getDefined(
    getNode<CodeBlockElement>(editor, [codeBlockIndex])
  );
  for (const codeLineEntry of getChildren<CodeBlockElement>([
    codeBlock,
    [codeBlockIndex],
  ])) {
    for (const [text, codeLineTextPath] of getChildren<CodeLineElement>(
      codeLineEntry
    )) {
      if (Path.compare(codeLineTextPath, path) < 0) {
        const codeLineText = getNodeString(text);
        offset += codeLineText.length;
      } else {
        break;
      }
    }
    if (Path.compare(codeLineEntry[1], path) < 0) {
      offset += 1; // new line
    } else {
      break;
    }
  }
  return offset;
}

function getOffsetFromPoint(
  editor: MyEditor,
  codeBlockPath: Path,
  point: Point
): number | null {
  if (Path.isDescendant(point.path, codeBlockPath)) {
    return getOffsetFromPath(editor, point.path) + point.offset;
  }
  return null;
}

export function getCodeBlockOffsets(
  editor: MyEditor,
  codeBlockPath: Path
): Offsets {
  const sel = editor.selection;
  if (!sel) {
    return { anchor: null, focus: null };
  }
  return {
    anchor: getOffsetFromPoint(editor, codeBlockPath, sel.anchor),
    focus: getOffsetFromPoint(editor, codeBlockPath, sel.anchor),
  };
}

function getPointFromOffset(
  editor: MyEditor,
  codeBlockPath: Path,
  offset: number
): Point | null {
  const codeBlock = getDefined(
    getNode<CodeBlockElement>(editor, codeBlockPath)
  );
  let currentOffset = 0;
  for (const entry of getChildren<CodeBlockElement>([
    codeBlock,
    codeBlockPath,
  ])) {
    for (const [text, path] of getChildren<CodeLineElement>(entry)) {
      const lineText = getNodeString(text);
      if (currentOffset + lineText.length < offset) {
        currentOffset += lineText.length;
      } else {
        return {
          path,
          offset: offset - currentOffset,
        };
      }
    }
    currentOffset += 1;
  }
  return null;
}

function getSelectionFromOffsets(
  editor: MyEditor,
  codeBlockPath: Path,
  offsets: Offsets
): Selection {
  const sel = cloneSelection(editor.selection);
  if (!sel) {
    return sel;
  }
  if (offsets.anchor) {
    const point = getPointFromOffset(editor, codeBlockPath, offsets.anchor);
    if (point) {
      sel.anchor = point;
    }
  }
  if (offsets.focus) {
    const point = getPointFromOffset(editor, codeBlockPath, offsets.focus);
    if (point) {
      sel.focus = point;
    }
  }
  return sel;
}

export function reinstateCursorOffsets(
  editor: MyEditor,
  codeBlockPath: Path,
  offsets: Offsets
): void {
  const sel = getSelectionFromOffsets(editor, codeBlockPath, offsets);
  if (sel) {
    select(editor, sel);
  }
}
