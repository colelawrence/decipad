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

// Code lines do not count numbers as full words, but autocomplete does, so we must have a boolean to use this in both parts.
export const findWordStart = (
  editor: MyEditor,
  at: Point,
  includeNumbers?: boolean
): WordStart => {
  return findWordStartAcc(editor, at, '', !!includeNumbers);
};

const findWordStartAcc = (
  editor: MyEditor,
  point: Point,
  word: string,
  includeNumbers: boolean
): WordStart => {
  const prevPoint = getPointBefore(editor, point, {
    distance: 1,
    unit: 'character',
  });
  if (!prevPoint) {
    return { word, start: point };
  }

  const char = getEditorString(editor, { anchor: point, focus: prevPoint });
  if (includeNumbers && !/[a-z0-9_.]/i.test(char)) {
    return { word, start: point };
  }

  if (!includeNumbers && !/[a-z_.]/i.test(char)) {
    return { word, start: point };
  }

  return findWordStartAcc(editor, prevPoint, char + word, includeNumbers);
};

type WordStart = {
  word: string;
  start: Point;
};
