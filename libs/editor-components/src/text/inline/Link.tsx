import { ELEMENT_LINK, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useSafeState } from '@decipad/react-utils';
import { atoms } from '@decipad/ui';

export const Link: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_LINK);
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
