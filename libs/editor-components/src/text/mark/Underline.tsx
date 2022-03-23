import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';

export const Underline: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Underline>{children}</atoms.Underline>
    </span>
  );
};
