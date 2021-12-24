import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../../utils/components';

export const Strikethrough: PlateComponent = ({ attributes, children }) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('Strikethrough is a leaf');
  }

  return (
    <atoms.Strikethrough slateAttrs={attributes}>
      {children}
    </atoms.Strikethrough>
  );
};
