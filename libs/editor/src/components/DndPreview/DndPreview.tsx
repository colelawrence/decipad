import { usePreview } from 'react-dnd-preview';
import { DRAG_ITEM_COLUMN, DragColumnItem } from '@decipad/editor-table';
import { useEditorRef } from '@udecode/plate';
import { useEffect, useRef } from 'react';
import { DndColumnPreview } from './DndColumnPreview';

export const DndPreview = () => {
  const editor = useEditorRef();

  const previewRef = useRef(null);
  const preview = usePreview<DragColumnItem>();
  const { display } = preview;

  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    editor.previewRef = previewRef;
  }, [editor]);

  return (
    <>
      {display && preview.itemType === DRAG_ITEM_COLUMN && (
        <DndColumnPreview {...preview} />
      )}
      <div
        ref={previewRef}
        data-testid="preview-ref"
        style={{
          position: 'absolute',
          top: -9999,
          left: -9999,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            transform: 'rotate(3deg)',
          }}
        />
      </div>
    </>
  );
};
