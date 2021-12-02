import { atoms } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const CodeLine: PlatePluginComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('CodeLine is not a leaf');
  }
  return <atoms.CodeLine slateAttrs={attributes}>{children}</atoms.CodeLine>;
};
