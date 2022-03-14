import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';

export const ListItem: types.PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <atoms.ListItem>{children}</atoms.ListItem>
    </div>
  );
};
