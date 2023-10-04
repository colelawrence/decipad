import { EditorBlock, EditorTitle } from '@decipad/ui';
import { FC } from 'react';
import { BaseEditor, Descendant, Text } from 'slate';
import { Editable, ReactEditor, Slate } from 'slate-react';

interface TitleEditorProps {
  tab: string | undefined;
  editor: BaseEditor & ReactEditor;
  initialValue: Descendant[];
  readOnly: boolean;
}

export const TitleEditor: FC<TitleEditorProps> = ({
  tab,
  editor,
  initialValue,
  readOnly,
}) => {
  return (
    <Slate key={tab} editor={editor} initialValue={initialValue}>
      <Editable
        readOnly={readOnly}
        renderElement={(props) => {
          if (!('type' in props.element))
            throw new Error('type should be present');
          if (props.element.type) {
            const leaf = props.element.children[0];
            if (!Text.isText(leaf)) throw new Error('Was expecting text');
            return (
              <EditorBlock
                {...props.attributes}
                blockKind="title"
                data-testId="notebook-title"
              >
                <EditorTitle
                  placeholder={
                    leaf.text.length === 0 ? 'My Notebook Title' : undefined
                  }
                >
                  {props.children}
                </EditorTitle>
              </EditorBlock>
            );
          }
          throw new Error('Title editor should contian nothing else');
        }}
      />
    </Slate>
  );
};
