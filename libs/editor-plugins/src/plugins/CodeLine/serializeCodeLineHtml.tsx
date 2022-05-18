import { getNodeString } from '@udecode/plate';
import { MySerializeHtml } from '@decipad/editor-types';

export const serializeCodeLineHtml: MySerializeHtml = ({
  element,
}): JSX.Element => {
  return <code>{getNodeString(element)}</code>;
};
