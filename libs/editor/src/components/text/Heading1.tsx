import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const Heading1: PlateComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('Heading1 is not a leaf');
  }

  return (
    <atoms.Heading1 Heading="h2" slateAttrs={attributes}>
      {children}
    </atoms.Heading1>
  );
};
