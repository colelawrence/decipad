import { parseStatement, Parser } from '@decipad/computer';
import { debug } from '../debug';
import { unwrapCodeContent } from './unwrapCodeContent';

const formErrorMessage = (error: Parser.ParserError): string =>
  `Parse error at line ${error.line}, char ${error.column}: ${error.message}`;

export const getCode = (wrappedContent: string): string | undefined => {
  const content = unwrapCodeContent(wrappedContent);
  debug('unwrapped content:', content);
  const parsed = parseStatement(content);
  if (
    content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0).length !== 1
  ) {
    throw new Error('please reply in just one line of code');
  }
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
