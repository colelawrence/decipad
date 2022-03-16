import { atoms } from '@decipad/ui';
import { types } from '@decipad/editor-config';

export const ListItemContent: types.PlateComponent = ({
  attributes,
  children,
}) => {
  return (
    <div {...attributes}>
      <atoms.ListItemContent>{children}</atoms.ListItemContent>
    </div>
  );
};
