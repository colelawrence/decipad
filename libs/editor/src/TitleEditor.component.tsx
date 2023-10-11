import { EditorBlock, EditorTitle } from '@decipad/ui';
import { FC, KeyboardEvent, useMemo } from 'react';
import { BaseEditor, BaseText, Descendant, Text } from 'slate';
import { Editable, ReactEditor, RenderElementProps, Slate } from 'slate-react';

interface TitleEditorProps {
  tab: string | undefined;
  editor: BaseEditor & ReactEditor;
  initialValue: Descendant[];
  readOnly: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const TitleEditor: FC<TitleEditorProps> = ({
  tab,
  editor,
  initialValue,
  readOnly,
}) => {
  const onKeyDown = useMemo(() => onKeyDownCurried(editor), [editor]);

  return (
    <Slate key={tab} editor={editor} initialValue={initialValue}>
      <Editable
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        onPaste={(e) => {
          e.preventDefault();
          e.stopPropagation();

          const data = e.clipboardData.getData('text/plain');
          if (data.length === 0) return;
          editor.insertText(data.replaceAll('\n', ''));
        }}
        renderElement={(props) => {
          const leaf = getLeaf(props);
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
        }}
      />
    </Slate>
  );
};

function getLeaf(props: RenderElementProps): BaseText {
  if (!('type' in props.element)) {
    throw new Error('type should be present');
  }
  if (!props.element.type) {
    throw new Error('Title editor should contian nothing else');
  }
  const leaf = props.element.children[0];
  if (!Text.isText(leaf)) {
    throw new Error('Was expecting text');
  }
  return leaf;
}

function onKeyDownCurried(
  editor: BaseEditor & ReactEditor
): (e: KeyboardEvent<HTMLDivElement>) => void {
  return (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      // Select All
      e.preventDefault();
      e.stopPropagation();
      editor.select([0, 0]);
    }
  };
}
