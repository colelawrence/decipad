import { Caption as UICaption, Tooltip } from '@decipad/ui';
import type {
  PlateComponent,
  UserIconKey,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import {
  ELEMENT_CAPTION,
  ELEMENT_VARIABLE_DEF,
  useMyEditorRef,
} from '@decipad/editor-types';
import { getNodeString, insertText, isElement } from '@udecode/plate-common';
import { getAboveNodeSafe } from '@decipad/editor-utils';
import {
  usePathMutatorCallback,
  useEnsureValidVariableName,
  useNodePath,
  useGeneratedName,
} from '@decipad/editor-hooks';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { useCallback, useContext, useRef } from 'react';
import { useFocused } from 'slate-react';
import { ClientEventsContext } from '@decipad/client-events';
import { useVariableEditorContext } from './VariableEditorContext';

export const Caption: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_CAPTION) {
    throw new Error(`Caption is meant to render caption elements`);
  }

  const editor = useMyEditorRef();
  const focused = useFocused();
  const userEvents = useContext(ClientEventsContext);

  const path = useNodePath(element);
  const setIcon = usePathMutatorCallback(editor, path, 'icon', 'Caption');
  const setColor = usePathMutatorCallback(editor, path, 'color', 'Caption');
  const setLabel = useCallback(
    (newOption: string) => {
      insertText(editor, newOption, {
        at: path,
      });
    },
    [editor, path]
  );

  const { generate, cancel } = useGeneratedName({
    element,
    setIcon,
    setLabel,
  });

  // Captions are not editable in read mode.
  const readOnly = useIsEditorReadOnly();
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
      segmentEvent: {
        type: 'action',
        action: 'widget renamed',
        props: {
          variant: parent?.[0].variant || 'expression',
        },
      },
    });
  }

  const caption = (
    <div
      {...attributes}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      data-testid="widget-caption"
    >
      <UICaption
        color={color}
        readOnly={readOnly}
        onChangeIcon={setIcon}
        onChangeColor={setColor}
        icon={element.icon as UserIconKey}
        empty={getNodeString(element).length === 0}
        onGenerateName={generate}
        onCancelGenerateName={cancel}
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
