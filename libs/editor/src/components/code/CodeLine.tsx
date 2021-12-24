import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const CodeLine: PlateComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeLine is not a leaf');
  }
  return <atoms.CodeLine slateAttrs={attributes}>{children}</atoms.CodeLine>;
};
