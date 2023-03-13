import {
  AutocompleteName,
  getBuiltinsForAutocomplete,
} from '@decipad/computer';
import { PlateComponent, useTEditorRef } from '@decipad/editor-types';
import type { AutocompleteDecorationProps } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { useWindowListener } from '@decipad/react-utils';
import { AutoCompleteMenu as UIAutoCompleteMenu } from '@decipad/ui';
import { ComponentProps, useCallback, useState } from 'react';
import { useFocused, useSelected } from 'slate-react';
import { commitAutocompleteItem } from './commitAutocompleteItem';

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
      blockId: n.blockId,
      explanation: n.explanation,
      syntax: n.syntax,
      example: n.example,
      formulaGroup: n.formulaGroup,
    })
  );
};

export type MenuItem = Parameters<
  NonNullable<ComponentProps<typeof UIAutoCompleteMenu>['onExecuteItem']>
>[0];

export const AutoCompleteMenu: PlateComponent<{
  leaf: AutocompleteDecorationProps;
}> = ({ attributes, children, leaf: { variableInfo } }) => {
  const word = variableInfo.variableName;

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
      if (!showAutoComplete || !variableInfo) return;

      commitAutocompleteItem(editor, variableInfo, item);
    },
    [editor, showAutoComplete, variableInfo]
  );

  if (showAutoComplete) {
    return (
      <span {...attributes}>
        <AutoCompleteWrapper
          search={word}
          blockId={variableInfo?.blockId ?? ''}
          onExecuteItem={onExecuteItem}
        />
        {children}
      </span>
    );
  }

  return <span {...attributes}>{children}</span>;
};

/** Subscribes to getNamesDefined$ only when necessary */
const AutoCompleteWrapper = ({
  blockId,
  search,
  onExecuteItem,
}: { blockId: string } & Omit<
  ComponentProps<typeof UIAutoCompleteMenu>,
  'identifiers'
>) => {
  const identifiers = useComputer().getNamesDefined$.useWithSelector(
    selectNames,
    blockId
  );

  if (!identifiers.length) {
    return null;
  }

  return (
    <UIAutoCompleteMenu
      search={search}
      identifiers={identifiers}
      onExecuteItem={onExecuteItem}
    />
  );
};
