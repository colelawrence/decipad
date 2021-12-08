import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const Underline: PlatePluginComponent = ({ attributes, children }) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('Underline is a leaf');
  }

  return <atoms.Underline slateAttrs={attributes}>{children}</atoms.Underline>;
};
