import type { ComponentProps } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { AutoCompleteMenu as UIAutoCompleteMenu } from '@decipad/ui';
import { useFocused, useSelected } from 'slate-react';
import { useCallback, useState } from 'react';
import { useWindowListener } from '@decipad/react-utils';
import { PlateComponent, useTEditorRef } from '@decipad/editor-types';
import {
  AutocompleteName,
  getBuiltinsForAutocomplete,
} from '@decipad/computer';
import { insertText } from '@udecode/plate';
import { BaseEditor, Transforms } from 'slate';
import type { AutocompleteDecorationProps } from '@decipad/editor-utils';

const compareNames = (a: AutocompleteName, b: AutocompleteName) => {
  const aScore = a.isLocal ? 1 : 0;
  const bScore = b.isLocal ? 1 : 0;

  return aScore - bScore;
};

const localNamesFirst = (names: AutocompleteName[]): AutocompleteName[] =>
  names.sort(compareNames);

const selectNames = (
  names: AutocompleteName[]
): ComponentProps<typeof UIAutoCompleteMenu>['identifiers'] => {
  return [...localNamesFirst(names), ...getBuiltinsForAutocomplete()].map(
    (n) => ({
      kind:
        n.kind === 'variable' ? ('variable' as const) : ('function' as const),
      identifier: n.kind === 'function' ? `${n.name}(` : n.name,
      type: n.type.kind,
    })
  );
};

type MenuItem = Parameters<
  NonNullable<ComponentProps<typeof UIAutoCompleteMenu>['onExecuteItem']>
>[0];

export const AutoCompleteMenu: PlateComponent<{
  leaf: AutocompleteDecorationProps;
}> = ({ attributes, children, leaf: { variableInfo } }) => {
  const word = variableInfo.variableName;

  const computer = useComputer();
  const selected = useSelected();
  const focused = useFocused();
  const editor = useTEditorRef();

  const [menuSuppressed, setMenuSuppressed] = useState(false);
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

  const onExecuteItem = useCallback(
    (item: MenuItem) => {
      if (showAutoComplete) {
        Transforms.select(editor as BaseEditor, variableInfo);
        Transforms.delete(editor as BaseEditor);
      }
      insertText(editor, item.identifier);

      if (item.kind !== 'function') {
        insertText(editor, ' ');
      }
    },
    [computer, editor, showAutoComplete, variableInfo]
  );

  const identifiers = computer.getNamesDefined$.useWithSelector(
    selectNames,
    variableInfo.blockId
  );

  if (showAutoComplete && identifiers?.length) {
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

  return <span {...attributes}>{children}</span>;
};
