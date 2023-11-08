import { debug } from '../debug';
import { unwrapCodeContent } from './unwrapCodeContent';

const removeResultArtifacts = (code: string) =>
  code
    .split('\n')
    .filter((line) => !line.startsWith('==>'))
    .join('\n');

const internalGetCode = (wrappedContent: string): string | undefined => {
  if (!wrappedContent) {
    return wrappedContent;
  }
  const content = removeResultArtifacts(unwrapCodeContent(wrappedContent));
  debug('unwrapped content:', content);
  return content;
};

const perhapsUnwrapInlineMarkers = (
  content: string | undefined
): string | undefined => {
  if (!content) {
    return content;
  }
  if (content.charAt(0) === '`' && content.charAt(content.length - 1) === '`') {
    return content.substring(1, content.length - 1);
  }
  return content;
};

export const getCode = (
  wrappedContent: string,
  removeUnncessaryEscapeChars = false
): string | undefined => {
  const result = perhapsUnwrapInlineMarkers(internalGetCode(wrappedContent));
  if (result && removeUnncessaryEscapeChars) {
    return result.replaceAll('\\', '');
  }
  return result;
};
