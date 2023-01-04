import { Caption as UICaption, Tooltip } from '@decipad/ui';
import {
  ELEMENT_CAPTION,
  ELEMENT_VARIABLE_DEF,
  PlateComponent,
  useTEditorRef,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import {
  getNodeString,
  findNodePath,
  getAboveNode,
  isElement,
} from '@udecode/plate';
import {
  useElementMutatorCallback,
  useEnsureValidVariableName,
} from '@decipad/editor-utils';
import { UserIconKey } from 'libs/ui/src/utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { useVariableEditorContext } from './VariableEditorContext';

export const Caption: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_CAPTION) {
    throw new Error(`Caption is meant to render caption elements`);
  }

  const editor = useTEditorRef();

  const setIcon = useElementMutatorCallback(editor, element, 'icon');
  const setColor = useElementMutatorCallback(editor, element, 'color');

  // Captions are not editable in read mode.
  const isEditable = !useIsEditorReadOnly();
  const { color } = useVariableEditorContext();

  // ensure variable name is unique
  const path = findNodePath(editor, element);
  const parent = getAboveNode<VariableDefinitionElement>(editor, {
    at: path,
    match: (node) => {
      return isElement(node) && node.type === ELEMENT_VARIABLE_DEF;
    },
  });
  const tooltip = useEnsureValidVariableName(element, parent?.[0].id);

  const caption = (
    <div
      {...attributes}
      contentEditable={isEditable}
      suppressContentEditableWarning
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
