import { molecules } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { useFocused } from 'slate-react';
import { Node } from 'slate';

export const EditableExpression: PlateComponent = ({ element, children }) => {
  const focused = useFocused();
  return (
    <molecules.EditableExpression
      focused={focused}
      content={(element && Node.string(element)) || ''}
    >
      {children}
    </molecules.EditableExpression>
  );
};
