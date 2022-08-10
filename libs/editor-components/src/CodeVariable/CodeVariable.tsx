import { PlateComponent, RichText, useTEditorRef } from '@decipad/editor-types';
import { useComputer, useResult } from '@decipad/react-contexts';
import { molecules } from '@decipad/ui';
import { useCallback, useRef } from 'react';
import { useObservable } from 'rxjs-hooks';
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
  leaf: { variableName, blockId, isDeclaration },
}) => {
  const rootRef = useRef<HTMLSpanElement>(null);

  const result = useResult(blockId, rootRef.current)?.results?.[0];

  const vars = result?.visibleVariables;
  const variableScope = getVariableScope(variableName, vars);
  const variableMissing = variableScope === 'undefined';

  const computer = useComputer();
  const defBlockId = useObservable(() => computer.getBlockId$(variableName));

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

  return (
    <span ref={rootRef} {...attributes}>
      <molecules.CodeVariable
        provideVariableDefLink={provideVariableDefLink}
        variableScope={variableScope}
        variableType={result?.type}
        variableValue={result?.value ?? undefined}
        defBlockId={defBlockId}
        onGoToDefinition={goToDefinition}
      >
        {children}
      </molecules.CodeVariable>
    </span>
  );
};
