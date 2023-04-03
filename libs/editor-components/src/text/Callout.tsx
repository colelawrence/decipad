import {
  ELEMENT_CALLOUT,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-utils';
import { useEditorStylesContext } from '@decipad/react-contexts';
import { Callout as UICallout } from '@decipad/ui';
import { AvailableSwatchColor, UserIconKey } from 'libs/ui/src/utils';
import { DraggableBlock } from '../block-management';
import { useTurnIntoProps } from '../utils';

export const Callout: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_CALLOUT);

  const editor = useTEditorRef();

  const path = useNodePath(element);
  const saveIcon = usePathMutatorCallback(editor, path, 'icon');
  const saveColor = usePathMutatorCallback(editor, path, 'color');
  const { color: defaultColor } = useEditorStylesContext();

  const turnIntoProps = useTurnIntoProps(element);

  return (
    <DraggableBlock
      blockKind="callout"
      element={element}
      {...turnIntoProps}
      {...attributes}
    >
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
