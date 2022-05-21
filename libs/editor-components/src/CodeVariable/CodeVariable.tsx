import { PlateComponent, RichText } from '@decipad/editor-types';
import { useComputer, useResult } from '@decipad/react-contexts';
import { atoms } from '@decipad/ui';
import { useRef } from 'react';
import { useObservable } from 'rxjs-hooks';

interface VariableInfo {
  blockId: string;
  variableName: string;
  isDeclaration: boolean;
}
type CodeLeaf = PlateComponent<{
  leaf: RichText & VariableInfo;
}>;

export const CodeVariable: CodeLeaf = ({
  attributes,
  children,
  leaf: { variableName, blockId, isDeclaration },
}) => {
  const rootRef = useRef<HTMLSpanElement>(null);

  const blockResult = useResult(blockId, rootRef.current);
  const vars = blockResult?.results?.[0]?.visibleVariables;
  const variableMissing = isDeclaration ? false : !vars?.has(variableName);

  const computer = useComputer();
  const defBlockId = useObservable(() => computer.getBlockId$(variableName));

  const pointyStylesToBeUsed =
    !isDeclaration && !variableMissing && typeof defBlockId === 'string';

  return (
    <span ref={rootRef} {...attributes}>
      <atoms.CodeVariable
        setPointyStyles={pointyStylesToBeUsed}
        variableMissing={variableMissing}
        onClick={() => {
          if (pointyStylesToBeUsed) {
            const el = document.getElementById(defBlockId);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el?.focus();
          }
        }}
      >
        {children}
      </atoms.CodeVariable>
    </span>
  );
};
