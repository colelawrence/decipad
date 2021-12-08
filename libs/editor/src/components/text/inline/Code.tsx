import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const Code: PlatePluginComponent = ({ attributes, children }) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('Code is a leaf');
  }

  return <atoms.Code slateAttrs={attributes}>{children}</atoms.Code>;
};
