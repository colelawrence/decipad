import { SerializeHtml } from '@udecode/plate';
import { Node } from 'slate';

export const serializeCodeLineHtml: SerializeHtml = ({
  element,
}): JSX.Element => {
  return <code>{Node.string(element)}</code>;
};
