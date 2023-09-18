import { PlateComponent } from '@decipad/editor-types';
import { Highlight as UIHighlight } from '@decipad/ui';

export const Highlight: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <UIHighlight>{children}</UIHighlight>
    </span>
  );
};
