import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';

export const Italic: types.PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Italic>{children}</atoms.Italic>
    </span>
  );
};
