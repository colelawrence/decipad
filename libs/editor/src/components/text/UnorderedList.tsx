import { molecules } from '@decipad/ui';
import { PlatePluginComponent } from '@udecode/plate';

export const UnorderedList: PlatePluginComponent = ({
  attributes,
  children,
}) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('UnorderedList is not a leaf');
  }

  return (
    <molecules.UnorderedList slateAttrs={attributes}>
      {children}
    </molecules.UnorderedList>
  );
};
