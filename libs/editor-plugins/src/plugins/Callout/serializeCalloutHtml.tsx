import { getNodeString } from '@udecode/plate';
import { MySerializeHtml } from '@decipad/editor-types';

export const serializeCalloutHtml: MySerializeHtml = ({ element }) => {
  return (
    <div
      data-type="callout"
      data-color={element.color}
      data-icon={element.icon}
    >
      {getNodeString(element)}
    </div>
  );
};
