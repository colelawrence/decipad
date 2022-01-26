import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../../types';

export const Bold: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Bold>{children}</atoms.Bold>
    </span>
  );
};
