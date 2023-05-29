import { createContext, FC, ReactNode } from 'react';
import { Subject } from 'rxjs';

export const EditorChangeContext = createContext<Subject<undefined>>(
  new Subject<undefined>()
);
export const EditorChangeContextProvider: FC<{
  children?: ReactNode;
  changeSubject: Subject<undefined>;
}> = ({ children, changeSubject }) => {
  return (
    <EditorChangeContext.Provider value={changeSubject}>
      {children}
    </EditorChangeContext.Provider>
  );
};
