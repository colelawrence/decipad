import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';

export const Strikethrough: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Strikethrough>{children}</atoms.Strikethrough>
    </span>
  );
};
