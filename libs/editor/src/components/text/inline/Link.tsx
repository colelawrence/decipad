import { atoms } from '@decipad/ui';
import { useSafeState } from '@decipad/react-utils';
import { ELEMENT_LINK } from '@decipad/editor-types';
import { PlateComponent } from '../../../types';

export const Link: PlateComponent = ({ attributes, children, element }) => {
  if ('data-slate-leaf' in attributes) {
    throw new Error('Link is not a leaf');
  }
  if (element?.type !== ELEMENT_LINK) {
    throw new Error('Link is meant to render link elements');
  }

  const [contentEditable, setContentEditable] = useSafeState(true);

  return (
    <span
      {...attributes}
      onPointerDown={() => {
        setContentEditable(false);
      }}
      onPointerUp={() => {
        setTimeout(() => {
          setContentEditable(true);
        }, 0);
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      contentEditable={contentEditable}
      // We're already in a contentEditable context handled by Slate
      suppressContentEditableWarning
    >
      <atoms.Link href={element.url}>{children}</atoms.Link>
    </span>
  );
};
