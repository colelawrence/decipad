import { parseStatement, Parser } from '@decipad/remote-computer';
import { debug } from '../debug';
import { unwrapCodeContent } from './unwrapCodeContent';

const formErrorMessage = (error: Parser.ParserError): string =>
  `Parse error at line ${error.line}, char ${error.column}: ${error.message}`;

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
  if (
    content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0).length !== 1
  ) {
    throw new Error('please reply in just one line of code');
  }
  const parsed = parseStatement(content);
  if (parsed.solution) {
    if (parsed.solution.type === 'assign') {
      return content.split('=')[1].trim();
    }
    if (parsed.solution.type === 'table') {
      throw new Error(
        `I asked you for a single expression and you gave me a ${parsed.solution.type}. Please change your response to a simple expression without an assignment.`
      );
    }
    return content;
  }
  if (parsed.error) {
    throw new Error(formErrorMessage(parsed.error));
  }
  return undefined;
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

export const getCode = (wrappedContent: string): string | undefined =>
  perhapsUnwrapInlineMarkers(internalGetCode(wrappedContent));
