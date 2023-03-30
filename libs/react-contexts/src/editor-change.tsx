import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  distinctUntilChanged,
  map,
  Observable,
  concat,
  debounceTime,
  of,
  merge,
  concatMap,
  from,
  filter,
} from 'rxjs';
import { dequal } from 'dequal';
import { PlateEditor, usePlateEditorRef } from '@udecode/plate';
import { getDefined } from '@decipad/utils';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import type { MyValue } from '../../editor-types/src';

export const EditorChangeContext = createContext<Observable<undefined>>(
  new Observable<undefined>()
);
export const EditorChangeContextProvider: FC<{
  children?: ReactNode;
  changeSubject: Observable<undefined>;
}> = ({ children, changeSubject }) => {
  return (
    <EditorChangeContext.Provider value={changeSubject}>
      {children}
    </EditorChangeContext.Provider>
  );
};

export interface UseEditorChangeOptions {
  debounceTimeMs?: number;
  injectObservable?: Observable<undefined>;
}

export function useEditorChange<T>(
  callback: (val: T) => void,
  selector: (editor: PlateEditor<MyValue>) => T | Promise<T>,
  { debounceTimeMs = 100, injectObservable }: UseEditorChangeOptions = {}
): void {
  const editor = getDefined(usePlateEditorRef<MyValue>());
  const editorChanges = useContext(EditorChangeContext);

  const callbackRef = useRef(callback);
  const selectorRef = useRef(selector);

  useEffect(() => {
    callbackRef.current = callback;
    selectorRef.current = selector;
  }, [callback, selector]);

  useEffect(() => {
    const editorChanges$ = concat(of(undefined), editorChanges);
    const observable = injectObservable
      ? merge(editorChanges$, injectObservable)
      : editorChanges$;
    const subscription = observable
      .pipe(
        debounceTime(debounceTimeMs),
        map(() => selectorRef.current(editor)),
        concatMap((v) => from(Promise.resolve(v))),
        filter((v) => v != null),
        distinctUntilChanged((cur, next) => dequal(cur, next))
      )
      .subscribe((value) => {
        callbackRef.current(value);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [editor, debounceTimeMs, injectObservable, editorChanges]);
}

export function useEditorSelector<T>(
  selector: (editor: PlateEditor<MyValue>) => T
): T {
  const editor = getDefined(usePlateEditorRef<MyValue>());

  const editorChanges = useContext(EditorChangeContext);

  const selectorRef = useRef(selector);

  useEffect(() => {
    selectorRef.current = selector;
  }, [selector]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const sub = editorChanges
        .pipe(
          map(() => selectorRef.current(editor)),
          distinctUntilChanged(dequal),
          map(() => undefined) // We only want to minimize onStoreChange() calls
        )
        .subscribe(onStoreChange);

      return () => sub.unsubscribe();
    },
    [editorChanges, editor]
  );

  const getSnapshot = useCallback(() => editor, [editor]);

  return useSyncExternalStoreWithSelector(
    subscribe,
    getSnapshot,
    getSnapshot,
    selector
  );
}

export function useEditorChangeState<T>(
  selector: Parameters<typeof useEditorChange<T>>[1],
  initialState: T,
  options: Parameters<typeof useEditorChange<T>>[2] = {}
) {
  const [value, setValue] = useState<T>(initialState);
  useEditorChange<T>(
    useCallback<Parameters<typeof useEditorChange<T>>[0]>(
      (newValue) => {
        if (!dequal(value, newValue)) {
          setValue(newValue);
        }
      },
      [value]
    ),
    selector,
    options
  );

  return value;
}
