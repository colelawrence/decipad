import type { MyEditor } from '@decipad/editor-types';
import { EditorBlock, EditorTitle, useCancelingEvent } from '@decipad/ui';
import {
  type FC,
  type KeyboardEvent,
  useMemo,
  type ClipboardEvent,
} from 'react';
import type { BaseEditor, BaseText, Descendant } from 'slate';
import { Text } from 'slate';
import type { RenderElementProps } from 'slate-react';
import { Editable, ReactEditor, Slate } from 'slate-react';

interface TitleEditorProps {
  tab: string | undefined;
  editor: BaseEditor & ReactEditor;
  initialValue: Descendant[];
  readOnly: boolean;
  onUndo: () => void;
  onRedo: () => void;
  mainEditor?: MyEditor;
}

export const TitleEditor: FC<TitleEditorProps> = ({
  tab,
  editor,
  initialValue,
  readOnly,
  mainEditor,
}) => {
  const onKeyDown = useMemo(
    () => onKeyDownCurried(editor, mainEditor),
    [editor, mainEditor]
  );

  return (
    <Slate key={tab} editor={editor} initialValue={initialValue}>
      <Editable
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        onPaste={useCancelingEvent((e: ClipboardEvent) => {
          const data = e.clipboardData.getData('text/plain');
          if (data.length === 0) return;
          editor.insertText(data.replaceAll('\n', ''));
        })}
        renderElement={(props) => {
          const leaf = getLeaf(props);
          return (
            <EditorBlock
              slateAttributes={props.attributes}
              blockKind="title"
              data-testId="notebook-title"
              isReadOnly={readOnly}
              AddNewLine={null}
              ContextualActions={null}
              DragHandle={null}
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
  editor: BaseEditor & ReactEditor,
  mainEditor?: MyEditor
): (e: KeyboardEvent<HTMLDivElement>) => void {
  return (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      // Select All
      e.preventDefault();
      e.stopPropagation();
      editor.select([0, 0]);
    }

    if (mainEditor && !e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      ReactEditor.focus(mainEditor as any);
      mainEditor.setSelection({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    }
  };
}
