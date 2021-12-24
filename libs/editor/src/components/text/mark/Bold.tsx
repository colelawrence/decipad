import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../../utils/components';

export const Bold: PlateComponent = ({ attributes, children }) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('Bold is a leaf');
  }

  return <atoms.Bold slateAttrs={attributes}>{children}</atoms.Bold>;
};
