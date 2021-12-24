import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const ListItem: PlateComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('ListItem is not a leaf');
  }

  return <atoms.ListItem slateAttrs={attributes}>{children}</atoms.ListItem>;
};
