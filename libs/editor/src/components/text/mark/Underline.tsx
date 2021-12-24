import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../../utils/components';

export const Underline: PlateComponent = ({ attributes, children }) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('Underline is a leaf');
  }

  return <atoms.Underline slateAttrs={attributes}>{children}</atoms.Underline>;
};
