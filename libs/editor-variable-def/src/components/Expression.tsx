import { Expression as UIExpression } from '@decipad/ui';
import {
  ELEMENT_EXPRESSION,
  MyEditor,
  PlateComponent,
  useTEditorRef,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import type { SerializedType } from '@decipad/computer';
import { useSelected } from 'slate-react';
import { getNodeString, getParentNode } from '@udecode/plate';
import { useNodePath } from '@decipad/editor-utils';
import { useCallback, useContext, useRef, useState } from 'react';
import { useEditorChange, useIsEditorReadOnly } from '@decipad/react-contexts';
import { ClientEventsContext } from '@decipad/client-events';

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
  const ed = useTEditorRef();
  const userEvents = useContext(ClientEventsContext);
  const isReadOnly = useIsEditorReadOnly();

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

  const nodeText = getNodeString(element);
  const oldStr = useRef(nodeText);

  // Not focused because we don't want to update everytime the user types,
  // just when they are done typing, which we assume is when they click away.
  // Sliders can be spammy, so they are handled seperately.
  if (nodeText !== oldStr.current && !focused) {
    oldStr.current = nodeText;
    const parent = getParent(ed);
    if (parent && parent.variant !== 'slider') {
      userEvents({
        type: 'action',
        action: 'widget value updated',
        props: {
          variant: parent.variant,
          isReadOnly,
        },
      });
    }
  }

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
