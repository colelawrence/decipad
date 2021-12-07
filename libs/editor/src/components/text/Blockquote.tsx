import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const Blockquote: PlatePluginComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('Blockquote is not a leaf');
  }

  return (
    <atoms.Blockquote slateAttrs={attributes}>{children}</atoms.Blockquote>
  );
};
