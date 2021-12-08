import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const Italic: PlatePluginComponent = ({ attributes, children }) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('Italic is a leaf');
  }

  return <atoms.Italic slateAttrs={attributes}>{children}</atoms.Italic>;
};
