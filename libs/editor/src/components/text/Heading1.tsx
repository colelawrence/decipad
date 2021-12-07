import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const Heading1: PlatePluginComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('Heading1 is not a leaf');
  }

  return (
    <atoms.Heading1 Heading="h2" slateAttrs={attributes}>
      {children}
    </atoms.Heading1>
  );
};
