import { PlateComponent } from '@decipad/editor-types';

export const ListItem: PlateComponent = ({ attributes, children }) => {
  return <div {...attributes}>{children}</div>;
};
