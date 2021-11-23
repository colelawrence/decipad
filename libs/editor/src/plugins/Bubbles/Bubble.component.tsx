import { PlatePluginComponent } from '@udecode/plate';
import { atoms } from '@decipad/ui';

export const Bubble: PlatePluginComponent = ({ attributes, children }) => {
  return (
    <atoms.CodeVariable slateAttrs={attributes}>{children}</atoms.CodeVariable>
  );
};
