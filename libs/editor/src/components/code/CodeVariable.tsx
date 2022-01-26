import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../types';

export const CodeVariable: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.CodeVariable>{children}</atoms.CodeVariable>
    </span>
  );
};
