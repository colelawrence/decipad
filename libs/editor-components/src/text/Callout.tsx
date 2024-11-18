import type {
  PlateComponent,
  UserIconKey,
  MyNode,
} from '@decipad/editor-types';
import { ELEMENT_CALLOUT, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import { useEditorStylesContext } from '@decipad/react-contexts';
import { Callout as UICallout } from '@decipad/ui';
import type { AvailableSwatchColor } from 'libs/ui/src/utils';
import { DraggableBlock } from '../block-management';

export const Callout: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_CALLOUT);

  const editor = useMyEditorRef();

  const path = useNodePath(element);
  const saveIcon = usePathMutatorCallback(
    editor,
    path,
    'icon' as keyof MyNode,
    'Callout'
  );
  const saveColor = usePathMutatorCallback(
    editor,
    path,
    'color' as keyof MyNode,
    'Callout'
  );
  const { color: defaultColor } = useEditorStylesContext();

  return (
    <DraggableBlock
      blockKind="callout"
      element={element}
      slateAttributes={attributes}
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
