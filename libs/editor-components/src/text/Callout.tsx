import {
  ELEMENT_CALLOUT,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { useEditorStylesContext } from '@decipad/react-contexts';
import { Callout as UICallout } from '@decipad/ui';
import { AvailableSwatchColor, UserIconKey } from 'libs/ui/src/utils';
import { DraggableBlock } from '../block-management';

export const Callout: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_CALLOUT);

  const editor = useTEditorRef();

  const saveIcon = useElementMutatorCallback(editor, element, 'icon');
  const saveColor = useElementMutatorCallback(editor, element, 'color');
  const { color: defaultColor } = useEditorStylesContext();

  return (
    <DraggableBlock blockKind="callout" element={element} {...attributes}>
      <UICallout
        icon={element.icon as UserIconKey}
        color={(element.color ?? defaultColor) as AvailableSwatchColor}
        saveIcon={saveIcon}
        saveColor={saveColor}
      >
        {children}
      </UICallout>
    </DraggableBlock>
  );
};
