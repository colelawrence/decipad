import { molecules } from '@decipad/ui';
import { PlateComponent } from '../../types';

export const OrderedList: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <molecules.OrderedList>{children}</molecules.OrderedList>
    </div>
  );
};
