import { Expression as UIExpression } from '@decipad/ui';
import {
  ELEMENT_EXPRESSION,
  PlateComponent,
  useTEditorRef,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { useSelected } from 'slate-react';
import { getNodeString, getParentNode } from '@udecode/plate';
import { useNodePath } from '@decipad/editor-utils';
import { useMemo } from 'react';
import { NodeEntry } from 'slate';

const DEFAULT_PLACEHOLDER = '1 km';

export const Expression: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  if (element?.type !== ELEMENT_EXPRESSION) {
    throw new Error(`Expression is meant to render expression elements`);
  }
  const editor = useTEditorRef();

  const focused = useSelected();

  const path = useNodePath(element);
  const parent = useMemo(
    () =>
      path &&
      (getParentNode(editor, path) as NodeEntry<VariableDefinitionElement>),
    [editor, path]
  );
  const type = parent?.[0].coerceToType;

  return (
    <div {...attributes}>
      <UIExpression
        type={type}
        focused={focused}
        placeholder={getNodeString(element) ? '' : DEFAULT_PLACEHOLDER}
      >
        {children}
      </UIExpression>
    </div>
  );
};
