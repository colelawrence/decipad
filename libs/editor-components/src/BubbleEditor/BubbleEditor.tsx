import { EditorBubblesContext } from '@decipad/react-contexts';
import React, { PropsWithChildren } from 'react';

type BubbleEditorProps = PropsWithChildren<{}>;

export const BubbleEditor: React.FC<BubbleEditorProps> = ({ children }) => {
  return (
    <EditorBubblesContext.Provider value={{}}>
      {children}
    </EditorBubblesContext.Provider>
  );
};
