import { MyEditor } from '@decipad/editor-types';
import { EditorChangeContext } from '@decipad/react-contexts';
import { createSelectableContext } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { dequal } from 'dequal';
import {
  ReactNode,
  useState,
  useMemo,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  mergeWith,
  Subject,
} from 'rxjs';
import {
  getContiguousGroups,
  getNewGroupsTargetLengths,
  MeasuredLengths,
  setIn,
} from './helpers';

/** Finds contiguous groups of blocks with type {blockTypes},
 * each of which will mount a BlockLengthSynchronizationProvider,
 * And makes sure that the lengths of the names in each group are synchronized.
 */
export const BlockLengthSynchronizationProvider = ({
  editor,
  children,
}: {
  editor: MyEditor;
  children: ReactNode;
}) => {
  const measuredLengths = useRef(new Map() as MeasuredLengths);
  const [targetWidths, setTargetWidths] = useState(
    () => new Map<string, ColumnWidths>()
  );

  const [updatedLength$] = useState(() => new Subject<undefined>());
  const editorChange$ = useContext(EditorChangeContext);

  useEffect(() => {
    const sub = editorChange$
      .pipe(
        debounceTime(100),
        mergeWith(of(undefined)),
        map(() => getContiguousGroups(editor.children)),
        distinctUntilChanged((cur, next) => dequal(cur, next)),
        // Take in signals of new lengths
        combineLatestWith(updatedLength$),
        map(([groups]) =>
          getNewGroupsTargetLengths(groups, measuredLengths.current)
        )
      )
      .subscribe(setTargetWidths);

    return () => sub.unsubscribe();
  }, [editor, editorChange$, updatedLength$]);

  const setMeasuredLength = useCallback(
    (group: ColumnGroupName, blockId: string, length: number | undefined) => {
      setIn(measuredLengths.current, blockId, group, length);

      updatedLength$.next(undefined);
    },
    [updatedLength$]
  );

  const context = useMemo(
    () => ({ targetWidths, setMeasuredLength }),
    [targetWidths, setMeasuredLength]
  );

  return (
    <NameSyncContext.Provider value={context}>
      {children}
    </NameSyncContext.Provider>
  );
};

export const initialGroups = {
  variableNameColumn: 0,
  resultColumn: 0,
} as const;

export type ColumnWidths = {
  variableNameColumn: number;
  resultColumn: number;
};

export type ColumnGroupName = keyof ColumnWidths;

export const NameSyncContext = createSelectableContext({
  targetWidths: new Map<string, ColumnWidths>(),
  setMeasuredLength: noop as (
    group: ColumnGroupName,
    blockId: string,
    newLength: number | undefined
  ) => void,
});
