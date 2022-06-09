import { MyEditor } from '@decipad/editor-types';
import { getEditorString, getPointAfter, getPointBefore } from '@udecode/plate';
import { Point } from 'slate';

export const nextIsWordChar = (editor: MyEditor, at: Point) => {
  const nextPoint = getPointAfter(editor, at, {
    distance: 1,
    unit: 'character',
  });
  if (!nextPoint) {
    return false;
  }

  const char = getEditorString(editor, { anchor: at, focus: nextPoint });
  return /[a-z]/i.test(char);
};

export const findWordStart = (editor: MyEditor, at: Point): WordStart => {
  return findWordStartAcc(editor, at, '');
};

const findWordStartAcc = (
  editor: MyEditor,
  point: Point,
  word: string
): WordStart => {
  const prevPoint = getPointBefore(editor, point, {
    distance: 1,
    unit: 'character',
  });
  if (!prevPoint) {
    return { word, start: point };
  }

  const char = getEditorString(editor, { anchor: point, focus: prevPoint });
  if (!/[a-z]/i.test(char)) {
    return { word, start: point };
  }

  return findWordStartAcc(editor, prevPoint, char + word);
};

type WordStart = {
  word: string;
  start: Point;
};
