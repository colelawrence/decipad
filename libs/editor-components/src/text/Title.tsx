import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_H1, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { EditorBlock, EditorTitle, isEmbed } from '@decipad/ui';
import { isElementEmpty } from '@udecode/plate-common';

export const Title: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_H1);

  const editor = useMyEditorRef();
  const readOnly = useIsEditorReadOnly();
  const embed = isEmbed();

  return (
    <>
      {!embed && (
        <EditorBlock
          blockKind="title"
          data-testid="notebook-title"
          {...attributes}
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
        </EditorBlock>
      )}
    </>
  );
};
