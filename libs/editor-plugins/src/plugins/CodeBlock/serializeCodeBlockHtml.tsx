import {
  CodeBlockElement,
  CodeLineElement,
  MySerializeHtml,
} from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';

const serializeCodeLine = (element: CodeLineElement): JSX.Element => {
  return <code>{getNodeString(element)}</code>;
};

export const serializeCodeBlockHtml: MySerializeHtml = ({ element }) => {
  const codeElement = element as CodeBlockElement;
  return <pre>{codeElement.children.map(serializeCodeLine)}</pre>;
};
