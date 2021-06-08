import { escapeRegExp, getText } from '@udecode/slate-plugins';
import { Editor, Point, Range } from 'slate';

interface MatchesTriggerReturn {
  range: Range | null | undefined;
  match: false | RegExpMatchArray | null;
}

export const matchesTrigger = (
  editor: Editor,
  { at }: { at: Point }
): MatchesTriggerReturn => {
  // Point at the start of line
  const lineStart = Editor.before(editor, at, { unit: 'line' });

  // Range from before to start
  const beforeRange = lineStart && Editor.range(editor, lineStart, at);

  // Before text
  const beforeText = getText(editor, beforeRange);

  // Starts with char and ends with word characters
  const escapedTrigger = escapeRegExp('@');

  const beforeRegex = new RegExp(`(?:^|\\s)${escapedTrigger}(\\S*)$`);

  // Match regex on before text
  const match = !!beforeText && beforeText.match(beforeRegex);

  // Point at the start of mention
  const mentionStart = match
    ? Editor.before(editor, at, {
        unit: 'character',
        distance: match[1].length + '/'.length,
      })
    : null;

  // Range from mention to start
  const mentionRange = mentionStart && Editor.range(editor, mentionStart, at);

  return {
    range: mentionRange,
    match,
  };
};
