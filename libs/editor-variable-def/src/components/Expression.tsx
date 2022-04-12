import { molecules } from '@decipad/ui';
import { PlateComponent, ELEMENT_EXPRESSION } from '@decipad/editor-types';
import { Node } from 'slate';
import { useSelected } from 'slate-react';

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
        placeholder={Node.string(element) ? '' : DEFAULT_PLACEHOLDER}
      >
        {children}
      </molecules.Expression>
    </div>
  );
};
