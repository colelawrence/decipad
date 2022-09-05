import { usePreview } from 'react-dnd-preview';
import { usePreviewStateFull } from 'react-dnd-preview/dist/cjs/usePreview';
import { DRAG_ITEM_COLUMN, DragColumnItem } from '@decipad/editor-table';
import { DndColumnPreview } from './DndColumnPreview';

export const DndPreview = () => {
  const preview = usePreview() as usePreviewStateFull<DragColumnItem>;
  const { display, itemType } = preview;

  if (!display) {
    return null;
  }

  if (itemType === DRAG_ITEM_COLUMN) {
    return <DndColumnPreview {...preview} />;
  }

  return null;
};
