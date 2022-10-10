import type { ComponentProps } from 'react';
import { useComputer, useEditorSelector } from '@decipad/react-contexts';
import { AutoCompleteMenu as UIAutoCompleteMenu } from '@decipad/ui';
import { useFocused, useSelected } from 'slate-react';
import { findWordStart, useSelection } from '@decipad/editor-utils';
import { useCallback, useEffect, useState } from 'react';
import { useWindowListener } from '@decipad/react-utils';
import {
  MyEditor,
  PlateComponent,
  useTEditorRef,
  ELEMENT_TABLE,
  TableElement,
} from '@decipad/editor-types';
import { getBuiltinsForAutocomplete } from '@decipad/computer';
import {
  getAboveNode,
  insertText,
  isCollapsed,
  TNodeEntry,
} from '@udecode/plate';
import { insertSmartRefOrText } from './insertSmartRefOrText';

type MenuItem = Parameters<
  NonNullable<ComponentProps<typeof UIAutoCompleteMenu>['onExecuteItem']>
>[0];

export const AutoCompleteMenu: PlateComponent = ({ attributes, children }) => {
  const computer = useComputer();
  const selected = useSelected();
  const focused = useFocused();
  const editor = useTEditorRef();
  const selection = useSelection();

  const [menuSuppressed, setMenuSuppressed] = useState(false);
  const [word, setWord] = useState('');
  const showAutoComplete = selected && focused && word && !menuSuppressed;

  const selectTable = useCallback(
    (e: MyEditor) =>
      (selection &&
        isCollapsed(selection) &&
        (getAboveNode(e, {
          match: { type: ELEMENT_TABLE },
          at: selection.anchor.path,
        }) as TNodeEntry<TableElement> | undefined)) ||
      undefined,
    [selection]
  );
  const tableAncestor = useEditorSelector<TNodeEntry<TableElement> | undefined>(
    selectTable
  );

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
      if (word && showAutoComplete) {
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
    [computer, editor, showAutoComplete, word]
  );

  if (selection) {
    const identifiers = [
      ...computer.getNamesDefined(tableAncestor?.[0].id),
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
          <UIAutoCompleteMenu
            search={word}
            identifiers={identifiers}
            onExecuteItem={onExecuteItem}
          />
          {children}
        </span>
      );
    }
  }

  return <span {...attributes}>{children}</span>;
};
