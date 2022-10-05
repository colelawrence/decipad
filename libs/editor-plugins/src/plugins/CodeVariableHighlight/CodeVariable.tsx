import { PlateComponent, RichText, useTEditorRef } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { CodeVariable as UICodeVariable } from '@decipad/ui';
import { useCallback } from 'react';
import {
  findNodePath,
  focusEditor,
  getEndPoint,
  setSelection,
  toSlateNode,
} from '@udecode/plate';

type VariableScope = 'local' | 'global' | 'undefined';

type VisibleVariables = {
  global: ReadonlySet<string>;
  local: ReadonlySet<string>;
};

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
  leaf: { variableName, blockId, isDeclaration, text },
}) => {
  const computer = useComputer();
  const defBlockId = computer.getVarBlockId$.use(variableName);
  const visibleVariables = computer.getBlockIdResult$.useWithSelector(
    (x) => x?.visibleVariables,
    blockId
  );

  const variableScope = getVariableScope(variableName, visibleVariables);
  const variableMissing = variableScope === 'undefined';

  const provideVariableDefLink =
    !isDeclaration && !variableMissing && typeof defBlockId === 'string';

  const editor = useTEditorRef();
  const goToDefinition = useCallback(() => {
    if (provideVariableDefLink && defBlockId) {
      const el = document.getElementById(defBlockId);
      if (el) {
        const slateNode = toSlateNode(editor, el);
        if (slateNode) {
          const path = findNodePath(editor, slateNode);
          if (path) {
            focusEditor(editor);
            const anchor = getEndPoint(editor, path);
            setSelection(editor, { anchor, focus: anchor });
          }
        }
      }
    }
  }, [defBlockId, editor, provideVariableDefLink]);

  if(!text){
    return  (
      <span {...attributes}>
        {children}
      </span>
    );
  }

  return (
    <span {...attributes}>
      <UICodeVariable
        provideVariableDefLink={provideVariableDefLink}
        variableScope={variableScope}
        defBlockId={defBlockId}
        onGoToDefinition={goToDefinition}
      >
        {children}
      </UICodeVariable>
    </span>
  );
};
