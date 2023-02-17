import {
  DeprecatedCodeBlockElement,
  CodeLineElement,
  MyEditor,
} from '@decipad/editor-types';
import { getChildren, getNode, getNodeString, select } from '@udecode/plate';
import { Path, Point, Selection } from 'slate';
import { cloneSelection } from './utils';

interface Offsets {
  anchor: number | undefined;
  focus: number | undefined;
}

function getOffsetFromPath(editor: MyEditor, path: Path): number | undefined {
  const [codeBlockIndex] = path;
  let offset = 0;
  const codeBlock = getNode<DeprecatedCodeBlockElement>(editor, [
    codeBlockIndex,
  ]);
  if (!codeBlock) {
    return;
  }
  for (const codeLineEntry of getChildren<DeprecatedCodeBlockElement>([
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
): number | undefined {
  if (Path.isDescendant(point.path, codeBlockPath)) {
    const offset = getOffsetFromPath(editor, point.path);
    if (offset == null) {
      return undefined;
    }
    return offset + point.offset;
  }
  return undefined;
}

export function getCodeBlockOffsets(
  editor: MyEditor,
  codeBlockPath: Path
): Offsets {
  const sel = editor.selection;
  if (!sel) {
    return { anchor: undefined, focus: undefined };
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
  const codeBlock = getNode<DeprecatedCodeBlockElement>(editor, codeBlockPath);
  if (!codeBlock) {
    return null;
  }
  let currentOffset = 0;
  for (const entry of getChildren<DeprecatedCodeBlockElement>([
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
