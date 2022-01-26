import { molecules } from '@decipad/ui';
import { PlateComponent } from '../../types';

export const UnorderedList: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <molecules.UnorderedList>{children}</molecules.UnorderedList>
    </div>
  );
};
