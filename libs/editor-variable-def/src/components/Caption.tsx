import { Caption as UICaption, Tooltip, UserIconKey } from '@decipad/ui';
import {
  ELEMENT_CAPTION,
  ELEMENT_VARIABLE_DEF,
  PlateComponent,
  useTEditorRef,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { getNodeString, isElement } from '@udecode/plate';
import { getAboveNodeSafe } from '@decipad/editor-utils';
import {
  usePathMutatorCallback,
  useEnsureValidVariableName,
  useNodePath,
} from '@decipad/editor-hooks';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { useContext, useRef } from 'react';
import { useFocused } from 'slate-react';
import { ClientEventsContext } from '@decipad/client-events';
import { useVariableEditorContext } from './VariableEditorContext';

export const Caption: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_CAPTION) {
    throw new Error(`Caption is meant to render caption elements`);
  }

  const editor = useTEditorRef();
  const focused = useFocused();
  const userEvents = useContext(ClientEventsContext);

  const path = useNodePath(element);
  const setIcon = usePathMutatorCallback(editor, path, 'icon');
  const setColor = usePathMutatorCallback(editor, path, 'color');

  // Captions are not editable in read mode.
  const isEditable = !useIsEditorReadOnly();
  const { color } = useVariableEditorContext();

  // ensure variable name is unique
  const parent = getAboveNodeSafe<VariableDefinitionElement>(editor, {
    at: path,
    match: (node) => {
      return isElement(node) && node.type === ELEMENT_VARIABLE_DEF;
    },
  });
  const tooltip = useEnsureValidVariableName(element, [parent?.[0].id]);

  // Analytics
  const nodeText = getNodeString(element);
  const oldStr = useRef(nodeText);

  // Not focused because we don't want to update everytime the user types,
  // just when they are done typing, which we assume is when they click away.
  if (nodeText !== oldStr.current && !focused) {
    oldStr.current = getNodeString(element);
    userEvents({
      type: 'action',
      action: 'widget renamed',
      props: {
        variant: parent?.[0].variant || 'expression',
      },
    });
  }

  const caption = (
    <div
      {...attributes}
      contentEditable={isEditable}
      suppressContentEditableWarning
      data-testid="widget-caption"
    >
      <UICaption
        color={color}
        onChangeIcon={setIcon}
        onChangeColor={setColor}
        icon={element.icon as UserIconKey}
        empty={getNodeString(element).length === 0}
      >
        {children}
      </UICaption>
    </div>
  );

  return tooltip ? (
    <Tooltip side="left" hoverOnly open trigger={caption}>
      {tooltip}
    </Tooltip>
  ) : (
    caption
  );
};
