import { molecules } from '@decipad/ui';
import { PlateComponent, ELEMENT_CAPTION } from '@decipad/editor-types';
import { Node } from 'slate';

export const Caption: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_CAPTION) {
    throw new Error(`Caption is meant to render caption elements`);
  }

  return (
    <div {...attributes}>
      <molecules.Caption empty={Node.string(element).length === 0}>
        {children}
      </molecules.Caption>
    </div>
  );
};
