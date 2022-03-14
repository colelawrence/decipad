import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';

export const Strikethrough: types.PlateComponent = ({
  attributes,
  children,
}) => {
  return (
    <span {...attributes}>
      <atoms.Strikethrough>{children}</atoms.Strikethrough>
    </span>
  );
};
