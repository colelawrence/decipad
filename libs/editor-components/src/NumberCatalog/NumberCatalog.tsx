import { useTEditorRef } from '@decipad/editor-types';
import { onDragStartSmartRef } from '@decipad/editor-utils';
import { EditorChangeContext, useComputer } from '@decipad/react-contexts';
import { NumberCatalog as UINumberCatalog } from '@decipad/ui';
import {
  ComponentProps,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { dequal } from 'dequal';
import {
  combineLatestWith,
  concat,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
} from 'rxjs';
import { selectCatalogNames } from './selectCatalogNames';
import { catalogItems } from './catalogItems';
import { toVar } from './toVar';
import { useOnDragEnd } from '../utils/useDnd';

const debounceEditorChangesMs = 1_000;

export function NumberCatalog() {
  const editor = useTEditorRef();
  const onDragStart = useMemo(() => onDragStartSmartRef(editor), [editor]);
  const onDragEnd = useOnDragEnd();

  const computer = useComputer();

  const [items, setItems] = useState<
    ComponentProps<typeof UINumberCatalog>['items']
  >([]);

  const editorChanges = useContext(EditorChangeContext);

  useEffect(() => {
    const catalog = catalogItems(editor);
    const editorChanges$ = concat(of(undefined), editorChanges);
    const sub = editorChanges$
      .pipe(
        combineLatestWith(
          concat(
            of(undefined),
            computer.getNamesDefined$.observeWithSelector(selectCatalogNames)
          )
        ),
        debounceTime(debounceEditorChangesMs),
        map(([, e]) => Array.isArray(e) && e.map(toVar)),
        filter(Boolean),
        map(catalog),
        distinctUntilChanged((cur, next) => dequal(cur, next))
      )
      .subscribe(setItems);

    return () => sub.unsubscribe();
  }, [computer, editor, editorChanges]);

  return (
    <UINumberCatalog
      items={items}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
}
