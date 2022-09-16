import { Underline as UIUnderline } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';

export const Underline: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <UIUnderline>{children}</UIUnderline>
    </span>
  );
};
