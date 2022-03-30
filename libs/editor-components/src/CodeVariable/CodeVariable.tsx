import { atoms } from '@decipad/ui';
import { PlateComponent, RichText } from '@decipad/editor-types';
import { useRef } from 'react';
import { useResult } from '@decipad/react-contexts';

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

  return (
    <span ref={rootRef} {...attributes}>
      <atoms.CodeVariable variableMissing={variableMissing}>
        {children}
      </atoms.CodeVariable>
    </span>
  );
};
