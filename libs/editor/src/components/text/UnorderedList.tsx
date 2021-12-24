import { molecules } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const UnorderedList: PlateComponent = ({ attributes, children }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('UnorderedList is not a leaf');
  }

  return (
    <molecules.UnorderedList slateAttrs={attributes}>
      {children}
    </molecules.UnorderedList>
  );
};
