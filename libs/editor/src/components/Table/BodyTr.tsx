import { BodyTrElement } from '@decipad/ui';
import {
  getParent,
  PlatePluginComponent,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate';
import { Editor, Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

export const removeRow = (editor: Editor, path: Path): void => {
  const bodyEntry = getParent(editor, path);
  if (!bodyEntry) {
    throw new Error('Cannot find table body');
  }
  const [bodyNode] = bodyEntry;
  // TODO do not show in the first place if only one row left?
  if (bodyNode.children.length > 1) {
    Transforms.removeNodes(editor, {
      at: path,
    });
  }
};

export const BodyTr: PlatePluginComponent = (props) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));
  if (!editor) {
    throw new Error('missing editor');
  }

  const { attributes } = props;
  if ('data-slate-leaf' in attributes) {
    throw new Error('Cannot render as a slate leaf');
  }

  return (
    <BodyTrElement
      {...props}
      onRemove={() => {
        const tableRowElement = attributes.ref.current;
        if (!(tableRowElement instanceof HTMLTableRowElement)) {
          throw new Error(
            `Expected table row element in ref, got ${attributes.ref.current}`
          );
        }
        removeRow(editor, ReactEditor.findPath(editor, props.element));
      }}
    />
  );
};
