import { molecules } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const UnorderedList: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <molecules.UnorderedList>{children}</molecules.UnorderedList>
    </div>
  );
};
