import { ListItemContent as UIListItemContent } from '@decipad/ui';
import type { PlateComponent } from '@decipad/editor-types';

export const ListItemContent: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <UIListItemContent>{children}</UIListItemContent>
    </div>
  );
};
