import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const Heading2: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <atoms.Heading2 Heading="h3">{children}</atoms.Heading2>
    </div>
  );
};
