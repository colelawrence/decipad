import { Expression as UIExpression } from '@decipad/ui';
import {
  ELEMENT_EXPRESSION,
  MyEditor,
  PlateComponent,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import type { SerializedType } from '@decipad/computer';
import { useSelected } from 'slate-react';
import { getNodeString, getParentNode } from '@udecode/plate';
import { useNodePath } from '@decipad/editor-utils';
import { useCallback, useState } from 'react';
import { useEditorChange } from '@decipad/react-contexts';

const getPlaceHolder = (type: SerializedType | undefined) => {
  if (!type) return '1 km';
  switch (type.kind) {
    case 'string':
      return 'Type here...';
    case 'date':
      switch (type.date) {
        case 'hour':
          return '2001-11-27 17:01';
        case 'day':
          return '2001-11-27';
        case 'month':
          return '2001-11';
        case 'year':
          return '2001';
        default:
          return 'date';
      }
  }
  return '1 km';
};

export const Expression: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  if (element?.type !== ELEMENT_EXPRESSION) {
    throw new Error(`Expression is meant to render expression elements`);
  }
  const [type, setType] = useState<SerializedType | undefined>(undefined);

  const focused = useSelected();
  const path = useNodePath(element);

  const widgetChange = useCallback(
    (newParent: VariableDefinitionElement | undefined) => {
      if (!newParent) return;
      setType(newParent.coerceToType);
    },
    []
  );
  const getParent = useCallback(
    (editor: MyEditor): VariableDefinitionElement | undefined => {
      if (path) {
        const parent = getParentNode<VariableDefinitionElement>(editor, path);
        if (parent) {
          return parent[0];
        }
      }
      return undefined;
    },
    [path]
  );
  useEditorChange(widgetChange, getParent);

  return (
    <div {...attributes}>
      <UIExpression
        type={type}
        focused={focused}
        placeholder={getNodeString(element) ? '' : getPlaceHolder(type)}
      >
        {children}
      </UIExpression>
    </div>
  );
};
