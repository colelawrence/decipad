import { createContext, FC, ReactNode, useContext, useEffect } from 'react';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { PlateEditor, usePlateEditorRef } from '@udecode/plate';
import { dequal } from 'dequal';

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
  selector: (editor: PlateEditor) => T
): void {
  const editor = usePlateEditorRef();
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
