import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const CodeVariable: PlateComponent = ({ attributes, children }) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('CodeVariable is a leaf');
  }

  return (
    <atoms.CodeVariable slateAttrs={attributes}>{children}</atoms.CodeVariable>
  );
};
