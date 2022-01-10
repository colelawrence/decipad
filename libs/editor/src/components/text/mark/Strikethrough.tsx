import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../../utils/components';

export const Strikethrough: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Strikethrough>{children}</atoms.Strikethrough>
    </span>
  );
};
