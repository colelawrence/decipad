import type { AutocompleteName } from '@decipad/language-interfaces';
import { getBuiltinsForAutocomplete } from '@decipad/remote-computer';
import type { PlateComponent } from '@decipad/editor-types';
import {
  DECORATE_AUTO_COMPLETE_MENU,
  useMyEditorRef,
} from '@decipad/editor-types';
import type { AutocompleteDecorationProps } from '@decipad/editor-utils';
import { useWindowListener } from '@decipad/react-utils';
import type { ACItemType, AutoCompleteMenuMode, Identifier } from '@decipad/ui';
import { AutoCompleteMenu as UIAutoCompleteMenu } from '@decipad/ui';
import sortBy from 'lodash/sortBy';
import type { ComponentProps } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocused, useSelected } from 'slate-react';
import { commitAutocompleteItem } from './commitAutocompleteItem';
import { useTableCaption } from './useTableCaption';
import { getPluginOptions } from '@udecode/plate-common';
import type { AutoCompletePlugin, MenuItem } from './types';
import { useComputer } from '@decipad/editor-hooks';

const localNamesFirst = (names: AutocompleteName[]): AutocompleteName[] =>
  sortBy(names, (name) => (name.isLocal ? 0 : 1));

const autoCompleteDebounceMs = 500;

const nameToIdentifier = (name: AutocompleteName): Identifier => ({
  kind: name.kind,
  identifier: name.name,
  inTable: name.inTable,
  type: name.type.kind,
  blockId: name.blockId,
  columnId: name.columnId,
  explanation: name.explanation,
  syntax: name.syntax,
  example: name.example,
  formulaGroup: name.formulaGroup,
});

const builtInIdentifiers: Identifier[] =
  getBuiltinsForAutocomplete().map(nameToIdentifier);

export const AutoCompleteMenu: PlateComponent<{
  leaf: AutocompleteDecorationProps;
}> = (props) => {
  const {
    attributes,
    children,
    leaf: { variableInfo },
  } = props;

  const word = variableInfo.variableName;

  const selected = useSelected();
  const focused = useFocused();
  const editor = useMyEditorRef();

  const { mode } = getPluginOptions<AutoCompletePlugin>(
    editor as any,
    DECORATE_AUTO_COMPLETE_MENU
  );

  const [menuSuppressed, setMenuSuppressed] = useState(false);
  const menuOpenRef = useRef(false);
  const showAutoComplete = selected && focused && word && !menuSuppressed;

  const onGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (showAutoComplete && menuOpenRef.current && !event.shiftKey) {
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
          mode={mode}
          search={word}
          blockId={variableInfo?.blockId ?? ''}
          onExecuteItem={onExecuteItem}
          openRef={menuOpenRef}
        />
        {children}
      </span>
    );
  }

  return <span {...attributes}>{children}</span>;
};

const autoCompleteTypes: Partial<Record<AutoCompleteMenuMode, ACItemType[]>> = {
  tableCell: ['number', 'string', 'date', 'boolean'],
};

/** Subscribes to getNamesDefined$ only when necessary */
const AutoCompleteWrapper = ({
  blockId,
  mode,
  ...props
}: { blockId: string } & Omit<
  ComponentProps<typeof UIAutoCompleteMenu>,
  'identifiers'
>) => {
  const identifiers = useComputer().getNamesDefined$.useWithSelectorDebounced(
    autoCompleteDebounceMs,
    (names) => localNamesFirst(names).map(nameToIdentifier),
    blockId
  );

  const identifiersWithBuiltIns = useMemo(() => {
    // Disable built-ins in 'tableCell' mode
    if (mode === 'tableCell') return identifiers;
    return [...identifiers, ...builtInIdentifiers];
  }, [identifiers, mode]);

  const filteredIdentifiers = useMemo(() => {
    const allowedTypes = mode && autoCompleteTypes[mode];
    if (!allowedTypes) return identifiersWithBuiltIns;
    return identifiersWithBuiltIns.filter((id) =>
      allowedTypes.includes(id.type)
    );
  }, [identifiersWithBuiltIns, mode]);

  const isInTable = useTableCaption();

  if (!identifiers.length) {
    return null;
  }

  return (
    <UIAutoCompleteMenu
      mode={mode}
      isInTable={isInTable}
      identifiers={filteredIdentifiers}
      {...props}
    />
  );
};
