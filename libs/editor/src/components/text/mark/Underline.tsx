import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../../utils/components';

export const Underline: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Underline>{children}</atoms.Underline>
    </span>
  );
};
