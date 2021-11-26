import { molecules } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const OrderedList: PlatePluginComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('OrderedList is not a leaf');
  }

  return (
    <molecules.OrderedList slateAttrs={attributes}>
      {children}
    </molecules.OrderedList>
  );
};
