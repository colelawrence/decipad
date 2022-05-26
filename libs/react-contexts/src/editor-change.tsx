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
export function useEditorChange<T>(
  callback: (val: T) => void,
  selector: (editor: PlateEditor<MyValue>) => T
): void {
  const editor = getDefined(usePlateEditorRef<MyValue>());
  const observable = useContext(EditorChangeContext);
  useEffect(() => {
    const subscription = observable
      .pipe(
        map(() => selector(editor)),
        distinctUntilChanged(dequal)
      )
      .subscribe(callback);
    return () => {
      subscription.unsubscribe();
    };
  }, [callback, selector, observable, editor]);
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
