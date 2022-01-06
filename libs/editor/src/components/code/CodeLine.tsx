import { atoms } from '@decipad/ui';
import { PlateComponent } from '../../utils/components';

export const CodeLine: PlateComponent = ({ attributes, children }) => {
  return (
    <div {...attributes}>
      <atoms.CodeLine>{children}</atoms.CodeLine>
    </div>
  );
};
