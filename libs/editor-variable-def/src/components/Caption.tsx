import { molecules } from '@decipad/ui';
import { PlateComponent, ELEMENT_CAPTION } from '@decipad/editor-types';
import { Node } from 'slate';
import { useEditorState } from '@udecode/plate';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { AvailableSwatchColor, UserIconKey } from 'libs/ui/src/utils';

export const Caption: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_CAPTION) {
    throw new Error(`Caption is meant to render caption elements`);
  }

  const editor = useEditorState();

  const setIcon = useElementMutatorCallback(editor, element, 'icon');
  const setColor = useElementMutatorCallback(editor, element, 'color');

  return (
    <div {...attributes}>
      <molecules.Caption
        color={element.color as AvailableSwatchColor}
        onChangeIcon={setIcon}
        onChangeColor={setColor}
        icon={element.icon as UserIconKey}
        empty={Node.string(element).length === 0}
      >
        {children}
      </molecules.Caption>
    </div>
  );
};
