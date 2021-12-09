import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const CodeVariable: PlatePluginComponent = ({
  attributes,
  children,
}) => {
  if (!('data-slate-leaf' in attributes)) {
    throw new Error('CodeVariable is a leaf');
  }

  return (
    <atoms.CodeVariable slateAttrs={attributes}>{children}</atoms.CodeVariable>
  );
};
