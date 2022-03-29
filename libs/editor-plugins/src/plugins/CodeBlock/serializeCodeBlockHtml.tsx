import { CodeBlockElement, CodeLineElement } from '@decipad/editor-types';
import { SerializeHtml } from '@udecode/plate';
import { Node } from 'slate';

const serializeCodeLine = (element: CodeLineElement): JSX.Element => {
  return <code>{Node.string(element)}</code>;
};

export const serializeCodeBlockHtml: SerializeHtml = ({ element }) => {
  const codeElement = element as CodeBlockElement;
  return <pre>{codeElement.children.map(serializeCodeLine)}</pre>;
};
