import { PlateComponent, RichText } from '@decipad/editor-types';
import { useComputer, useResult } from '@decipad/react-contexts';
import { atoms } from '@decipad/ui';
import { VisibleVariables } from 'libs/computer/src/computer/getVisibleVariables';
import { VariableScope } from 'libs/ui/src/atoms/CodeVariable/CodeVariable';
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

export const getVariableScope = (
  variableName: string,
  vars: VisibleVariables | undefined
): VariableScope => {
  if (vars?.local.has(variableName)) {
    return 'local';
  }
  if (vars?.global.has(variableName)) {
    return 'global';
  }
  return 'undefined';
};

export const CodeVariable: CodeLeaf = ({
  attributes,
  children,
  leaf: { variableName, blockId, isDeclaration },
}) => {
  const rootRef = useRef<HTMLSpanElement>(null);

  const blockResult = useResult(blockId, rootRef.current);
  const vars = blockResult?.results?.[0]?.visibleVariables;
  const variableScope = getVariableScope(variableName, vars);
  const variableMissing = variableScope === 'undefined';

  const computer = useComputer();
  const defBlockId = useObservable(() => computer.getBlockId$(variableName));

  const pointyStylesToBeUsed =
    !isDeclaration && !variableMissing && typeof defBlockId === 'string';

  return (
    <span ref={rootRef} {...attributes}>
      <atoms.CodeVariable
        setPointyStyles={pointyStylesToBeUsed}
        variableScope={variableScope}
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
