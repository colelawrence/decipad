import { Bold as UIBold } from '@decipad/ui';
import type { PlateComponent } from '@decipad/editor-types';

export const Bold: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <UIBold>{children}</UIBold>
    </span>
  );
};
