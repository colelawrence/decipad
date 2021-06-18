import {
  getNextIndex,
  getPreviousIndex,
  isCollapsed,
  isPointAtWordEnd,
} from '@udecode/slate-plugins';
import React, { useCallback, useState } from 'react';
import { Editor, Location, Range } from 'slate';
import { Command } from './commands';
import { insertNode } from './insertNode';
import { matchesTrigger } from './matchesTrigger';

interface UseDashCommandsReturn {
  search: string;
  index: number;
  target: Range | null;
  values: Command[];
  onKeyDownDashCommands: (e: React.KeyboardEvent, editor: Editor) => void;
  onChangeDashCommands: (editor: Editor) => void;
  onAddElement: (
    editor: Editor,
    type: string,
    target: Location,
    mode: 'block' | 'inline' | 'inline-block'
  ) => void;
}

export const useDashCommands = (commands: Command[]): UseDashCommandsReturn => {
  const [target, setTarget] = useState<Range | null>(null);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');

  const values = commands.filter(
    (c: Command) =>
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().replace(' ', '').includes(search.toLowerCase())
  );

  const onAddElement = useCallback(
    (
      editor: Editor,
      type: string,
      target: Location,
      mode: 'block' | 'inline' | 'inline-block'
    ) => {
      if (target !== null) {
        insertNode(editor, type, target, mode);
        return setTarget(null);
      }
    },
    []
  );

  const onKeyDownDashCommands = useCallback(
    (e: React.KeyboardEvent, editor: Editor) => {
      if (target) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          return setIndex(getNextIndex(index, values.length - 1));
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          return setIndex(getPreviousIndex(index, values.length - 1));
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          return setTarget(null);
        }

        if (['Tab', 'Enter'].includes(e.key)) {
          if (typeof values[index] === 'undefined') {
            return false;
          } else {
            e.preventDefault();
            onAddElement(
              editor,
              values[index].type,
              target,
              values[index].mode
            );
            return false;
          }
        }
      }
    },
    [values, index, setIndex, target, setTarget, onAddElement]
  );

  const onChangeDashCommands = useCallback(
    (editor: Editor) => {
      const { selection } = editor;

      if (selection && isCollapsed(selection)) {
        const cursor = Range.start(selection);

        const { range, match: beforeMatch } = matchesTrigger(editor, {
          at: cursor,
        });

        if (beforeMatch && isPointAtWordEnd(editor, { at: cursor })) {
          setTarget(range as Range);
          const [, word] = beforeMatch;
          setSearch(word);
          setIndex(0);
          return;
        }

        setTarget(null);
      }
    },
    [setTarget, setSearch, setIndex]
  );

  return {
    search,
    index,
    target,
    values,
    onChangeDashCommands,
    onKeyDownDashCommands,
    onAddElement,
  };
};
