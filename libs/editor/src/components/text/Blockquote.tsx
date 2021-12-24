import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const Blockquote: PlateComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('Blockquote is not a leaf');
  }

  return (
    <atoms.Blockquote slateAttrs={attributes}>{children}</atoms.Blockquote>
  );
};
