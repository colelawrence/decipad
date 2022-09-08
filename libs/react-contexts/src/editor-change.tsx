import { createContext, FC, ReactNode, useContext, useEffect } from 'react';
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
import { identity } from 'ramda';
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

interface UseEditorChangeOptions {
  debounceTimeMs?: number;
  injectObservable?: Observable<undefined>;
  selectsPromise?: boolean;
}

export function useEditorChange<T>(
  callback: (val: T) => void,
  selector: (editor: PlateEditor<MyValue>) => T | Promise<T>,
  {
    debounceTimeMs = 100,
    injectObservable,
    selectsPromise = false,
  }: UseEditorChangeOptions = {}
): void {
  const editor = getDefined(usePlateEditorRef<MyValue>());
  const editorChanges = useContext(EditorChangeContext);

  useEffect(() => {
    const editorChanges$ = concat(of(undefined), editorChanges);
    const observable = injectObservable
      ? merge(editorChanges$, injectObservable)
      : editorChanges$;
    const subscription = observable
      .pipe(
        debounceTime(debounceTimeMs),
        map(() => selector(editor)),
        filter((v) => v != null),
        selectsPromise
          ? concatMap((v) => from(v as unknown as Promise<T>))
          : map(identity),
        filter((v) => v != null),
        distinctUntilChanged(dequal)
      )
      .subscribe(callback);

    return () => {
      subscription.unsubscribe();
    };
  }, [
    callback,
    selector,
    editor,
    debounceTimeMs,
    injectObservable,
    editorChanges,
    selectsPromise,
  ]);
}
