import { usePreview } from 'react-dnd-preview';
import { DRAG_ITEM_COLUMN, DragColumnItem } from '@decipad/editor-table';
import { DndColumnPreview } from './DndColumnPreview';

export const DndPreview = () => {
  const preview = usePreview<DragColumnItem>();
  const { display } = preview;

  if (!display) {
    return null;
  }

  if (preview.itemType === DRAG_ITEM_COLUMN) {
    return <DndColumnPreview {...preview} />;
  }

  return null;
};
