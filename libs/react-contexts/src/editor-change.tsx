import { createContext, FC, ReactNode, useContext, useEffect } from 'react';
import { distinctUntilChanged, map, Observable } from 'rxjs';
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
