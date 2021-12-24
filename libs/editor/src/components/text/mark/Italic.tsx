import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../../utils/components';

export const Italic: PlateComponent = ({ attributes, children }) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('Italic is a leaf');
  }

  return <atoms.Italic slateAttrs={attributes}>{children}</atoms.Italic>;
};
