import { SerializeHtml } from '@udecode/plate';
import { Node } from 'slate';

export const serializeCalloutHtml: SerializeHtml = ({ element }) => {
  return (
    <div
      data-type="callout"
      data-color={element.color}
      data-icon={element.icon}
    >
      {Node.string(element)}
    </div>
  );
};
