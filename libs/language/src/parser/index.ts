import { n } from '../utils';
import * as AST from './ast-types';
import * as Parser from './parser-types';
import { tokenizer, BracketCounter } from '../grammar/tokenizer';
import { parse as languageParse } from './parser';
import { SyntaxError } from './SyntaxError';

export { AST, Parser, n, SyntaxError };

export function parseBlock(source: string): Parser.ParsedBlock {
  if (source.trim() === '') {
    return { solution: n('block', n('noop')) };
  } else {
    const bracketError = validateBrackets(source);
    if (bracketError) {
      return {
        error: { message: 'Bracket error', bracketError },
      };
    }

    try {
      const solution = languageParse(source.trimEnd()) as AST.Block;

      return { solution };
    } catch (err) {
      return {
        error: fromParseError(err as Error),
      };
    }
  }
}

export function parse(blocks: string[]): Parser.ParsedBlock[] {
  return blocks.map((block) => parseBlock(block));
}

function fromParseError(err: Error): Parser.ParserError {
  const resultError: Parser.ParserError = {
    message: err.message,
    token: (err as unknown as { token?: moo.Token }).token,
  };
  if (err instanceof SyntaxError) {
    resultError.detailMessage = err.detailMessage;
    resultError.line = err.line;
    resultError.column = err.column;
    resultError.expected = err.expected;
    resultError.source = err.source;
    resultError.expected = err.expected;
  }
  return resultError;
}

function validateBrackets(source: string) {
  const counter = new BracketCounter();
  for (const token of tokenizer.reset(source)) {
    counter.feed(token);
  }
  counter.finalize();
  return counter.validationError;
}
