import type { ComponentProps } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { AutoCompleteMenu as UIAutoCompleteMenu } from '@decipad/ui';
import { useFocused, useSelected } from 'slate-react';
import { findWordStart, useSelection } from '@decipad/editor-utils';
import { useCallback, useEffect, useState } from 'react';
import { useWindowListener } from '@decipad/react-utils';
import { PlateComponent, useTEditorRef } from '@decipad/editor-types';
import { getBuiltinsForAutocomplete } from '@decipad/computer';
import { insertText } from '@udecode/plate';
import { insertSmartRefOrText } from './insertSmartRefOrText';

type MenuItem = Parameters<
  NonNullable<ComponentProps<typeof UIAutoCompleteMenu>['onExecuteItem']>
>[0];

export const AutoCompleteMenu: PlateComponent = ({ attributes }) => {
  const computer = useComputer();
  const selected = useSelected();
  const focused = useFocused();
  const editor = useTEditorRef();
  const selection = useSelection();

  const [menuSuppressed, setMenuSuppressed] = useState(false);
  const [word, setWord] = useState('');
  const showAutoComplete = selected && focused && word && !menuSuppressed;

  const onGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (showAutoComplete && !event.shiftKey) {
        switch (event.key) {
          case 'Escape':
            setMenuSuppressed(true);
            event.stopPropagation();
            event.preventDefault();
            break;
        }
      }
    },
    [showAutoComplete]
  );
  useWindowListener('keydown', onGlobalKeyDown, true);

  useEffect(() => {
    if (selection) {
      const { word: w } = findWordStart(editor, selection.focus, true);
      setWord(w);
    }
  }, [editor, selection, selection?.focus]);

  const onExecuteItem = useCallback(
    (item: MenuItem) => {
      if (word) {
        // deleteBackword('word') was misbehaving with ^ and + operators.
        for (let i = 0; i < word.length; i += 1) {
          editor.deleteBackward('character');
        }
      }
      insertSmartRefOrText(editor, computer, item.identifier);

      if (item.kind !== 'function') {
        insertText(editor, ' ');
      }
    },
    [computer, editor, word]
  );

  if (selection) {
    const identifiers = [
      ...computer.getNamesDefined(),
      ...getBuiltinsForAutocomplete(),
    ].map((n) => ({
      kind:
        n.kind === 'variable' ? ('variable' as const) : ('function' as const),
      identifier: n.kind === 'function' ? `${n.name}(` : n.name,
      type: n.type.kind,
    }));

    if (showAutoComplete && identifiers.length) {
      return (
        <span {...attributes}>
          {/* not rendering children because it would render a non-breaking space */}
          <UIAutoCompleteMenu
            search={word}
            identifiers={identifiers}
            onExecuteItem={onExecuteItem}
          />
        </span>
      );
    }
  }

  return null;
};
