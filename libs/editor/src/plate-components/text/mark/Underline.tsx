import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';

export const Underline: types.PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Underline>{children}</atoms.Underline>
    </span>
  );
};
