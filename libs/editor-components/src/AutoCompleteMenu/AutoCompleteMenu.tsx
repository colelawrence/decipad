import { useComputer } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { useFocused, useSelected } from 'slate-react';
import { findWordStart, useSelection } from '@decipad/editor-utils';
import { useCallback, useEffect, useState } from 'react';
import { useWindowListener } from '@decipad/react-utils';
import { PlateComponent, useTEditorRef } from '@decipad/editor-types';
import { getBuiltinsForAutocomplete } from '@decipad/computer';

export const AutoCompleteMenu: PlateComponent = ({ attributes }) => {
  const computer = useComputer();
  const selected = useSelected();
  const focused = useFocused();
  const editor = useTEditorRef();
  const selection = useSelection();

  const [menuSuppressed, setMenuSuppressed] = useState(false);
  const [word, setWord] = useState('');
  const showAutoComplete = selected && focused && word && !menuSuppressed;

  const onKeyDown = useCallback(
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
  useWindowListener('keydown', onKeyDown, true);

  useEffect(() => {
    if (selection) {
      const { word: w } = findWordStart(editor, selection.focus);
      setWord(w);
    }
  }, [editor, selection, selection?.focus]);

  if (selection) {
    const identifiers = [
      ...computer.getNamesDefined(),
      ...getBuiltinsForAutocomplete(),
    ].map((n) => ({
      kind:
        n.kind === 'variable' ? ('variable' as const) : ('function' as const),
      identifier: n.kind === 'variable' ? n.name : `${n.name}(`,
      type: n.type.kind,
    }));

    if (showAutoComplete && identifiers.length) {
      return (
        <span {...attributes}>
          {/* not rendering children because it would render a non-breaking space */}
          <organisms.AutoCompleteMenu
            search={word}
            identifiers={identifiers}
            onExecuteItem={(item) => {
              if (word) {
                editor.deleteBackward('word');
              }
              editor.insertText(item.identifier);
              if (item.kind === 'variable') {
                editor.insertText(' ');
              }
            }}
          />
        </span>
      );
    }
  }

  return null;
};
