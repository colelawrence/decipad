import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';

export const Highlight: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Highlight>{children}</atoms.Highlight>
    </span>
  );
};
