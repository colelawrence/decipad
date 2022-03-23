import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';

export const Italic: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Italic>{children}</atoms.Italic>
    </span>
  );
};
