import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';

export const Bold: types.PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Bold>{children}</atoms.Bold>
    </span>
  );
};
