import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const ListItem: PlatePluginComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('ListItem is not a leaf');
  }

  return <atoms.ListItem slateAttrs={attributes}>{children}</atoms.ListItem>;
};
