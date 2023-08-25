import {
  ELEMENT_H1,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { EditorBlock, EditorTitle, isEmbed } from '@decipad/ui';
import { isElementEmpty } from '@udecode/plate';

// TODO Title should probably not be a part of the editor in the first place

export const Title: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_H1);
  const editor = useTEditorRef();
  const readOnly = useIsEditorReadOnly();

  if (isEmbed()) {
    return null;
  }

  return (
    <EditorBlock
      blockKind="title"
      data-testid="notebook-title"
      {...attributes}
      contentEditable={readOnly ? false : undefined}
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
  );
};
