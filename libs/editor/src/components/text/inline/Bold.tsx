import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const Bold: PlatePluginComponent = ({ attributes, children }) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('Bold is a leaf');
  }

  return <atoms.Bold slateAttrs={attributes}>{children}</atoms.Bold>;
};
