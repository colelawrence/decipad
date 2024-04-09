import { Italic as UIItalic } from '@decipad/ui';
import type { PlateComponent } from '@decipad/editor-types';

export const Italic: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <UIItalic>{children}</UIItalic>
    </span>
  );
};
