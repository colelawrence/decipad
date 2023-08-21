import { ClientEventsContext } from '@decipad/client-events';
import { AutocompleteName } from '@decipad/computer';
import { onDragStartSmartRef } from '@decipad/editor-utils';
import {
  useComputer,
  useDeciEditorContextProvider,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import {
  SlashCommandsMenu,
  EditorSidebar as UIEditorSidebar,
  NumberCatalog as UINumberCatalog,
} from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { execute } from '../utils/slashCommands';
import { useOnDragEnd } from '../utils/useDnd';
import { catalogItems } from './catalogItems';
import { selectCatalogNames } from './selectCatalogNames';
import { toVar } from './toVar';
import { CatalogItems } from './types';

const catalogDebounceTimeMs = 1_000;

export function EditorSidebar() {
  const editor = useDeciEditorContextProvider();
  const notebookMetaData = useNotebookMetaData();

  const onDragStart = useMemo(
    () => editor && onDragStartSmartRef(editor),
    [editor]
  );
  const onDragEnd = useOnDragEnd();

  const computer = useComputer();

  const clientEvent = useContext(ClientEventsContext);

  const catalog = useMemo(() => editor && catalogItems(editor), [editor]);
  const items = computer.getNamesDefined$.useWithSelectorDebounced(
    catalogDebounceTimeMs,
    useCallback(
      (_items: AutocompleteName[]) => {
        return catalog ? catalog(selectCatalogNames(_items).map(toVar)) : [];
      },
      [catalog]
    )
  );

  const myOnExec = useCallback(
    (command: string) => {
      const elementPath =
        editor &&
        (editor.selection?.anchor.path || [editor.children.length - 1]);

      if (elementPath) {
        execute({
          editor,
          path: elementPath.slice(0, 1),
          command,
          deleteBlock: false,
          getAvailableIdentifier:
            computer.getAvailableIdentifier.bind(computer),
        });
      }
      clientEvent({
        type: 'action',
        action: 'sidebar block add',
        props: { command },
      });
    },
    [clientEvent, computer, editor]
  );

  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState<CatalogItems>([]);

  useEffect(() => {
    // Filter the items array based on the filter value
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [items, search]);

  return (
    <ErrorBoundary fallback={<></>}>
      <UIEditorSidebar
        items={filteredItems}
        search={search}
        setSearch={setSearch}
        {...notebookMetaData}
      >
        <UINumberCatalog
          items={filteredItems}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
        <SlashCommandsMenu
          variant="inline"
          onExecute={myOnExec}
          search={search}
        />
      </UIEditorSidebar>
    </ErrorBoundary>
  );
}
