import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_H1, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { EditorTitle, isEmbed } from '@decipad/ui';
import { isElementEmpty } from '@udecode/plate-common';
import { DraggableBlock } from '../block-management';

export const Title: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_H1);

  const editor = useMyEditorRef();
  const readOnly = useIsEditorReadOnly();
  const embed = isEmbed();

  if (embed) {
    return null;
  }

  return (
    <DraggableBlock
      blockKind="title"
      element={element}
      slateAttributes={attributes}
    >
      <EditorTitle
        placeholder={
          isElementEmpty(editor, element) && !readOnly
            ? 'My notebook'
            : undefined
        }
      >
        {children}
      </EditorTitle>
    </DraggableBlock>
  );
};
