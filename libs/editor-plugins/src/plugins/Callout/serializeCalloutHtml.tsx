import { SerializeHtml } from '@udecode/plate';
import { Node } from 'slate';

export const serializeCalloutHtml: SerializeHtml = ({ element }) => {
  return <div data-type="callout">{Node.string(element)}</div>;
};
