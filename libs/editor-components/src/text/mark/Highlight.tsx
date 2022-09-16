import { Highlight as UIHighlight } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';

export const Highlight: PlateComponent = ({ attributes, children }) => {
  return (
    <span {...attributes}>
      <UIHighlight>{children}</UIHighlight>
    </span>
  );
};
