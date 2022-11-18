import { PlateComponent } from '@decipad/editor-types';
import { Spoiler as UISpoiler } from '@decipad/ui';

export const Spoiler: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <UISpoiler>{children}</UISpoiler>
    </span>
  );
};
