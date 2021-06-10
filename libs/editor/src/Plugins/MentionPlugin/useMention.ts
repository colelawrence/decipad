import {
  getNextIndex,
  getPreviousIndex,
  isCollapsed,
  isPointAtWordEnd,
} from '@udecode/slate-plugins';
import { useCallback, useState } from 'react';
import { Editor, Range, Transforms } from 'slate';
import { insertMention } from './insertMention';
import { matchesTrigger } from './matchesTrigger';

interface IUseMention {
  search: string;
  index: number;
  target: Range | null | undefined;
  filteredUsers: string[];
  onChangeMention: (editor: Editor) => void;
  onKeyDownMention: (e: React.KeyboardEvent, editor: Editor) => false | void;
}

export const useMention = (users: string[]): IUseMention => {
  const [target, setTarget] = useState<Range | null | undefined>(null);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');

  const filteredUsers = users
    .filter((u) => u.toLowerCase().startsWith(search.toLowerCase()))
    .slice(0, 10);

  const onKeyDownMention = useCallback(
    (e: React.KeyboardEvent, editor: Editor) => {
      if (target) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          return setIndex(getNextIndex(index, filteredUsers.length - 1));
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          return setIndex(getPreviousIndex(index, filteredUsers.length - 1));
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          return setTarget(null);
        }

        if (['Tab', 'Enter'].includes(e.key)) {
          if (typeof filteredUsers[index] === 'undefined') {
            return false;
          } else {
            e.preventDefault();
            Transforms.select(editor, target);
            insertMention(editor, filteredUsers[index]);
            return setTarget(null);
          }
        }
      }
    },
    [index, target, filteredUsers]
  );

  const onChangeMention = useCallback((editor: Editor) => {
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
  }, []);

  return {
    search,
    index,
    target,
    filteredUsers,
    onChangeMention,
    onKeyDownMention,
  };
};
