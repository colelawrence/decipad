import { PlateComponent, RichText } from '@decipad/editor-types';
import { useComputer, useResult } from '@decipad/react-contexts';
import { molecules } from '@decipad/ui';
import { useRef } from 'react';
import { useObservable } from 'rxjs-hooks';
import type { SerializedType, Result } from '@decipad/computer';

type VariableScope = 'local' | 'global' | 'undefined';

type VisibleVariables = {
  global: ReadonlySet<string>;
  local: ReadonlySet<string>;
};

interface VariableInfo {
  blockId: string;
  variableName: string;
  isDeclaration: boolean;
  type: SerializedType;
  value: Result.OneResult;
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
  leaf: { variableName, blockId, isDeclaration, type, value },
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
      <molecules.CodeVariable
        setPointyStyles={pointyStylesToBeUsed}
        variableScope={variableScope}
        variableType={type}
        variableValue={value}
        onClick={() => {
          if (pointyStylesToBeUsed) {
            const el = document.getElementById(defBlockId);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el?.focus();
          }
        }}
      >
        {children}
      </molecules.CodeVariable>
    </span>
  );
};
