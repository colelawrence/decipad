import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';

export const ListItemContent: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <atoms.ListItemContent>{children}</atoms.ListItemContent>
    </div>
  );
};
