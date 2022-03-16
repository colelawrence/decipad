import { types } from '@decipad/editor-config';

export const ListItem: types.PlateComponent = ({ attributes, children }) => {
  return <div {...attributes}>{children}</div>;
};
