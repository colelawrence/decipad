import { PlatePluginComponent } from '@udecode/plate';

export const ListItemElement: PlatePluginComponent = ({
  children,
  attributes,
}) => {
  return <li {...attributes}>{children}</li>;
};
