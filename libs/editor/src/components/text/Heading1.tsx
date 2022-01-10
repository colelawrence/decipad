import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const Heading1: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <atoms.Heading1 Heading="h2">{children}</atoms.Heading1>
    </div>
  );
};
