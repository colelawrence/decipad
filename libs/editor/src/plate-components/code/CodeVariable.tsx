import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';

export const CodeVariable: types.PlateComponent = ({
  attributes,
  children,
}) => {
  return (
    <span {...attributes}>
      <atoms.CodeVariable>{children}</atoms.CodeVariable>
    </span>
  );
};
