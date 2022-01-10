import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const ListItem: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <atoms.ListItem>{children}</atoms.ListItem>
    </div>
  );
};
