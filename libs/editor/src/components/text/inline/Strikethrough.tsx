import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const Strikethrough: PlatePluginComponent = ({
  attributes,
  children,
}) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('Strikethrough is a leaf');
  }

  return (
    <atoms.Strikethrough slateAttrs={attributes}>
      {children}
    </atoms.Strikethrough>
  );
};
