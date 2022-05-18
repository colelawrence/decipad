import { molecules } from '@decipad/ui';
import { ELEMENT_EXPRESSION, PlateComponent } from '@decipad/editor-types';
import { useSelected } from 'slate-react';
import { getNodeString } from '@udecode/plate';

const DEFAULT_PLACEHOLDER = '1 km';

export const Expression: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  if (element?.type !== ELEMENT_EXPRESSION) {
    throw new Error(`Expression is meant to render expression elements`);
  }

  const focused = useSelected();

  return (
    <div {...attributes}>
      <molecules.Expression
        focused={focused}
        placeholder={getNodeString(element) ? '' : DEFAULT_PLACEHOLDER}
      >
        {children}
      </molecules.Expression>
    </div>
  );
};
