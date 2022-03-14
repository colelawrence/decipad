import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';

export const Code: types.PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Code>{children}</atoms.Code>
    </span>
  );
};
