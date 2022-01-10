import { molecules } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const OrderedList: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <molecules.OrderedList>{children}</molecules.OrderedList>
    </div>
  );
};
