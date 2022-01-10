import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const Blockquote: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <atoms.Blockquote>{children}</atoms.Blockquote>
    </div>
  );
};
