import { useCallback, useMemo } from 'react';
import { useTEditorRef } from '@decipad/editor-types';
import { onDragStartSmartRef } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { NumberCatalog as UINumberCatalog } from '@decipad/ui';
import { AutocompleteName } from '@decipad/computer';
import { selectCatalogNames } from './selectCatalogNames';
import { catalogItems } from './catalogItems';
import { toVar } from './toVar';
import { useOnDragEnd } from '../utils/useDnd';

const catalogDebounceTimeMs = 1_000;

export function NumberCatalog() {
  const editor = useTEditorRef();
  const onDragStart = useMemo(() => onDragStartSmartRef(editor), [editor]);
  const onDragEnd = useOnDragEnd();

  const computer = useComputer();

  const catalog = useMemo(() => catalogItems(editor), [editor]);
  const items = computer.getNamesDefined$.useWithSelectorDebounced(
    catalogDebounceTimeMs,
    useCallback(
      (_items: AutocompleteName[]) => {
        return catalog(selectCatalogNames(_items).map(toVar));
      },
      [catalog]
    )
  );

  return (
    <UINumberCatalog
      items={items}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
}
