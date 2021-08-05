import {
  getNextIndex,
  getPreviousIndex,
  isCollapsed,
  isPointAtWordEnd,
  KeyboardHandler,
  matchesTriggerAndPattern,
  OnChange,
  PlatePlugin,
  SPEditor,
} from '@udecode/plate';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { Range, Transforms } from 'slate';
import { SlashCommandsSelect } from '.';
import { Command, commands } from './commands';
import { insertBlock } from './utils/insertBlock';

export const useSlashCommandsPlugin = (): {
  plugin: PlatePlugin;
  getSlashCommandsProps: () => ComponentProps<typeof SlashCommandsSelect>;
  searchValue: string;
} => {
  const [targetRange, setTargetRange] = useState<Range | null>(null);
  const [valueIndex, setValueIndex] = useState(0);
  const [search, setSearch] = useState('');

  const values = useMemo(
    () =>
      commands
        .filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.type.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5),
    [search]
  );

  const onAddBlock = useCallback(
    (editor: SPEditor, data: Command) => {
      if (targetRange !== null) {
        Transforms.select(editor, targetRange);
        insertBlock(editor, targetRange, { pluginKey: data.type });
      }
    },
    [targetRange]
  );

  const onKeyDownSlashCommands: KeyboardHandler = useCallback(
    (editor) => (e) => {
      if (targetRange) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          return setValueIndex(getNextIndex(valueIndex, values.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          return setValueIndex(getPreviousIndex(valueIndex, values.length - 1));
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          return setTargetRange(null);
        }

        if (['Tab', 'Enter'].includes(e.key)) {
          e.preventDefault();
          onAddBlock(editor, values[valueIndex]);
          return false;
        }
      }
      return undefined;
    },
    [targetRange, valueIndex, values, onAddBlock]
  );

  const onChangeSlashCommands: OnChange = useCallback(
    (editor) => () => {
      const { selection } = editor;

      if (selection && isCollapsed(selection)) {
        const cursor = Range.start(selection);

        const { range, match: beforeMatch } = matchesTriggerAndPattern(editor, {
          at: cursor,
          trigger: '/',
          pattern: '\\S*',
        });

        if (beforeMatch && isPointAtWordEnd(editor, { at: cursor })) {
          setTargetRange(range as Range);
          const [, word] = beforeMatch;
          setSearch(word);
          setValueIndex(0);
          return;
        }

        setTargetRange(null);
      }
    },
    [setTargetRange, setSearch, setValueIndex]
  );

  return {
    plugin: useMemo(
      () => ({
        onChange: onChangeSlashCommands,
        onKeyDown: onKeyDownSlashCommands,
      }),
      [onChangeSlashCommands, onKeyDownSlashCommands]
    ),

    getSlashCommandsProps: useCallback(
      () => ({
        at: targetRange,
        valueIndex,
        setValueIndex,
        options: values,
        onClickSlashCommands: onAddBlock,
      }),
      [onAddBlock, targetRange, valueIndex, values]
    ),
    searchValue: search,
  };
};
