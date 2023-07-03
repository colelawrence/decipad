import { PlateComponent, RichText } from '@decipad/editor-types';
import { VariableInfo } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { CodeVariable as UICodeVariable } from '@decipad/ui';

type VariableScope = 'local' | 'global' | 'undefined';

type VisibleVariables = {
  global: ReadonlySet<string>;
  local: ReadonlySet<string>;
};

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
  leaf: { variableName, blockId, isDeclaration, text },
}) => {
  // console.log('variableName', variableName);
  const computer = useComputer();
  const defBlockId = computer.getVarBlockId$.use(variableName);
  // console.log('defBlockId', defBlockId);
  const visibleVariables = computer.getBlockIdResult$.useWithSelector(
    (x) => x?.visibleVariables,
    blockId
  );
  // console.log('visibleVariables', visibleVariables);

  const variableScope = getVariableScope(variableName, visibleVariables);
  // console.log('variableScope', variableScope);
  const variableMissing = variableScope === 'undefined';
  // console.log('variableMissing', variableMissing);

  const provideVariableDefLink =
    !isDeclaration && !variableMissing && typeof defBlockId === 'string';

  if (!text) {
    return <span {...attributes}>{children}</span>;
  }

  return (
    <span {...attributes}>
      <UICodeVariable
        provideVariableDefLink={provideVariableDefLink}
        variableScope={variableScope}
        variableMissing={variableMissing && !isDeclaration}
        defBlockId={defBlockId}
      >
        {children}
      </UICodeVariable>
    </span>
  );
};
