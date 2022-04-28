import { ELEMENT_CALLOUT, PlateComponent } from '@decipad/editor-types';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { atoms } from '@decipad/ui';
import { useEditorState } from '@udecode/plate';
import { AvailableSwatchColor, UserIconKey } from 'libs/ui/src/utils';
import { DraggableBlock } from '../block-management';

export const Callout: PlateComponent = ({ attributes, children, element }) => {
  if (!element) {
    throw new Error('Callout is not a leaf');
  }

  if (element?.type !== ELEMENT_CALLOUT) {
    throw new Error(`This should be a callout element, not ${element?.type}.`);
  }

  const editor = useEditorState();

  const saveIcon = useElementMutatorCallback(editor, element, 'icon');
  const saveColor = useElementMutatorCallback(editor, element, 'color');

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="callout" element={element}>
        <atoms.Callout
          icon={element.icon as UserIconKey}
          color={element.color as AvailableSwatchColor}
          saveIcon={saveIcon}
          saveColor={saveColor}
        >
          {children}
        </atoms.Callout>
      </DraggableBlock>
    </div>
  );
};
