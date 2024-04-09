import { InlineCode } from '@decipad/ui';
import type { PlateComponent } from '@decipad/editor-types';

export const Code: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <InlineCode>{children}</InlineCode>
    </span>
  );
};
