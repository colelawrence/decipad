import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  Observable,
  take,
  concat,
  from,
  merge,
  debounceTime,
} from 'rxjs';
import { dequal } from 'dequal';
import { PlateEditor, usePlateEditorRef } from '@udecode/plate';
import type { MyValue } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';

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

interface UseEditorChangeOptions {
  debounceTimeMs?: number;
  injectObservable?: Observable<undefined>;
}

export function useEditorChange<T>(
  callback: (val: T) => void,
  selector: (editor: PlateEditor<MyValue>) => T,
  { debounceTimeMs = 100, injectObservable }: UseEditorChangeOptions = {}
): void {
  const editor = getDefined(usePlateEditorRef<MyValue>());
  const editorChanges = useContext(EditorChangeContext);
  const first = from([undefined]);
  const editorChanges$ = concat(first, editorChanges);
  useEffect(() => {
    const observable = injectObservable
      ? merge(editorChanges$, injectObservable)
      : editorChanges$;
    const subscription = observable
      .pipe(
        debounceTime(debounceTimeMs),
        map(() => selector(editor)),
        distinctUntilChanged(dequal)
      )
      .subscribe(callback);

    // manually trigger the first event

    return () => {
      subscription.unsubscribe();
    };
  }, [
    callback,
    selector,
    editor,
    debounceTimeMs,
    injectObservable,
    editorChanges$,
  ]);
}

export function useChangedEditorElement() {
  const editor = getDefined(usePlateEditorRef<MyValue>());
  const observable = useContext(EditorChangeContext);

  return useCallback(
    <T,>(
      selector: (e: PlateEditor<MyValue>) => T | null,
      cb: (e: T) => void
    ) => {
      const subscription = observable
        .pipe(
          map(() => selector(editor)),
          catchError(() => {
            subscription.unsubscribe();
            return EMPTY;
          }),
          filter((v): v is Exclude<T, null> => v != null),
          take(1)
        )
        .subscribe(cb);
    },
    [observable, editor]
  );
}
