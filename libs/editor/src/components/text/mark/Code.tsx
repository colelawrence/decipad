import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../../types';

export const Code: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Code>{children}</atoms.Code>
    </span>
  );
};
