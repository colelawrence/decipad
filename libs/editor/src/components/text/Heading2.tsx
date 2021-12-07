import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const Heading2: PlatePluginComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('Heading2 is not a leaf');
  }

  return (
    <atoms.Heading2 Heading="h3" slateAttrs={attributes}>
      {children}
    </atoms.Heading2>
  );
};
