import { usePreview } from 'react-dnd-preview';
import { DRAG_ITEM_COLUMN, DragColumnItem } from '@decipad/editor-table';
import { useEditorRef } from '@udecode/plate';
import { useEffect, useRef } from 'react';
import { cssVar, setCssVar } from '@decipad/ui';
import { varStyles } from '@decipad/ui/src/styles/code-block';
import { useDndPreviewSelectors } from '@decipad/react-contexts';
import { DndColumnPreview } from './DndColumnPreview';

export const DndPreview = () => {
  const editor = useEditorRef();

  const previewText = useDndPreviewSelectors().previewText();

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
          css={[
            varStyles,
            {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',

              padding: '2px 8px',

              backgroundColor: cssVar('backgroundColor'),
              border: `1px solid ${cssVar('borderColor')}`,
              borderRadius: '8px',
              ...setCssVar('currentTextColor', cssVar('weakTextColor')),
            },
            {
              transform: 'rotate(3deg)',
            },
          ]}
        >
          {previewText}
        </div>
      </div>
    </>
  );
};
