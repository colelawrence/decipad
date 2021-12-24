import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../../utils/components';

export const Code: PlateComponent = ({ attributes, children }) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('Code is a leaf');
  }

  return <atoms.Code slateAttrs={attributes}>{children}</atoms.Code>;
};
