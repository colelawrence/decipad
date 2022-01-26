import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../types';

export const Heading2: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <atoms.Heading2 Heading="h3">{children}</atoms.Heading2>
    </div>
  );
};
