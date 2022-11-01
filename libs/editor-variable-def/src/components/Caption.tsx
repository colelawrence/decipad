import { Caption as UICaption } from '@decipad/ui';
import {
  ELEMENT_CAPTION,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';
import { useElementMutatorCallback } from '@decipad/editor-utils';
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

  return (
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
};
