import { molecules } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const OrderedList: PlateComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('OrderedList is not a leaf');
  }

  return (
    <molecules.OrderedList slateAttrs={attributes}>
      {children}
    </molecules.OrderedList>
  );
};
