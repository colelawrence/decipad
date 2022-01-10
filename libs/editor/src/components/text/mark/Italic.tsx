import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../../utils/components';

export const Italic: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Italic>{children}</atoms.Italic>
    </span>
  );
};
