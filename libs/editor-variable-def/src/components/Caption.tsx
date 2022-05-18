import { molecules } from '@decipad/ui';
import {
  ELEMENT_CAPTION,
  PlateComponent,
  useTEditorState,
} from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { AvailableSwatchColor, UserIconKey } from 'libs/ui/src/utils';

export const Caption: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_CAPTION) {
    throw new Error(`Caption is meant to render caption elements`);
  }

  const editor = useTEditorState();

  const setIcon = useElementMutatorCallback(editor, element, 'icon');
  const setColor = useElementMutatorCallback(editor, element, 'color');

  return (
    <div {...attributes}>
      <molecules.Caption
        color={element.color as AvailableSwatchColor}
        onChangeIcon={setIcon}
        onChangeColor={setColor}
        icon={element.icon as UserIconKey}
        empty={getNodeString(element).length === 0}
      >
        {children}
      </molecules.Caption>
    </div>
  );
};
