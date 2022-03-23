import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';

export const Code: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <atoms.Code>{children}</atoms.Code>
    </span>
  );
};
