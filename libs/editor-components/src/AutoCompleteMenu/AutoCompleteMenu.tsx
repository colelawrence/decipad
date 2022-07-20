import { useComputer } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { useFocused, useSelected } from 'slate-react';
import { findWordStart, useSelection } from '@decipad/editor-utils';
import { useCallback, useEffect, useState } from 'react';
import { useWindowListener } from '@decipad/react-utils';
import { PlateComponent, useTEditorState } from '@decipad/editor-types';

export const AutoCompleteMenu: PlateComponent = ({ attributes }) => {
  const computer = useComputer();
  const selected = useSelected();
  const focused = useFocused();
  const editor = useTEditorState();
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
    const identifiers = computer
      .getNamesDefined()
      .filter((n) => n.kind === 'variable')
      .map((n) => ({
        kind: 'variable' as const,
        identifier: n.name,
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
              editor.insertText(' ');
            }}
          />
        </span>
      );
    }
  }

  return null;
};
