import { ComponentProps, useEffect, useMemo, useState } from 'react';
import { useTEditorRef } from '@decipad/editor-types';
import { NumberCatalog as UINumberCatalog } from '@decipad/ui';
import { onDragStartSmartRef } from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import {AutocompleteName} from '@decipad/language';
import {useComputer} from '@decipad/react-contexts';
import { debounceTime } from 'rxjs';
import {delayValueTimeout} from '@decipad/react-utils';

type NamesProp = ComponentProps<typeof UINumberCatalog>['names']

export function NumberCatalog() {
  const editor = useTEditorRef();
  const onDragStart = useMemo(() => onDragStartSmartRef(editor), [editor]);

  const computer = useComputer();
  const [names, setNames] = useState<NamesProp>([]) 

  useEffect(()=>{
    const sub = computer.getNamesDefined$.observeWithSelector(selectCatalogNames).pipe(debounceTime(delayValueTimeout)).subscribe(setNames)
    return () => {sub.unsubscribe()}
  },[computer])

  if (!isFlagEnabled('NUMBER_CATALOG')) {
    return null;
  }

  return <UINumberCatalog names={names} onDragStart={onDragStart} />;
}

function selectCatalogNames(items: AutocompleteName[]) {
  return items.flatMap(({ kind, type, name, blockId }) => {
    if (
      kind === 'variable' &&
      name &&
      blockId &&
      ['boolean', 'date', 'number', 'string', 'range'].includes(type.kind)
    ) {
      return [{ name, blockId }];
    }

    return [];
  });
}
