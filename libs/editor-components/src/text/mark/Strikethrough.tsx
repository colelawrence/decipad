import { Strikethrough as UIStrikethrough } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';

export const Strikethrough: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <UIStrikethrough>{children}</UIStrikethrough>
    </span>
  );
};
