import React, { PropsWithChildren, useCallback, useState } from 'react';
import {
  EditingBubble,
  EditorBubblesContext,
  useResult,
} from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { BubbleFormula } from '@decipad/editor-types';

type BubbleEditorProps = PropsWithChildren<{}>;

export const BubbleEditor: React.FC<BubbleEditorProps> = ({ children }) => {
  const [editing, setEditing] = useState<EditingBubble>();

  const blockId = editing?.blockId || '';

  const result = useResult(blockId);
  const codeResult = result?.results?.[0];

  const updateFormula = useCallback(
    (value: Partial<BubbleFormula>) => {
      if (!editing) return;

      setEditing((old) => {
        if (!old) return old;

        const formula = {
          ...editing.formula,
          ...value,
        };

        editing.updateValue(formula);

        return { ...old, formula };
      });
    },
    [editing, setEditing]
  );

  return (
    <EditorBubblesContext.Provider value={{ editing, setEditing, codeResult }}>
      {children}

      {editing && (
        <organisms.BubbleEditor
          key={blockId}
          onChange={updateFormula}
          defaultName={editing.formula.name}
          defaultExpr={editing.formula.expression}
          onClose={() => setEditing(undefined)}
        />
      )}
    </EditorBubblesContext.Provider>
  );
};
