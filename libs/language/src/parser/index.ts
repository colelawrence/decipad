import { BracketCounter, tokenizer } from '../grammar/tokenizer';
import { isExpression, n } from '../utils';
import { SyntaxError } from './SyntaxError';
import { annotateWithCacheKeys } from './annotateWithCacheKeys';
import * as AST from './ast-types';
import { parse as languageParse } from './parser';
import * as Parser from './parser-types';

export { decilang } from './decilang-tag';
export { AST, Parser, n, SyntaxError };

export function parseBlock(
  source: string,
  id?: string,
  addCacheKeys = false,
  suppressErrorLog = false
): Parser.ParsedBlock {
  if (source?.trim() === '') {
    return { solution: n('block', n('noop')) };
  } else {
    const bracketError = validateBrackets(source);
    if (bracketError) {
      return {
        error: { message: 'Bracket error', bracketError },
      };
    }

    try {
      const solution = languageParse(
        source.trimEnd(),
        suppressErrorLog
      ) as AST.Block;

      if (id) {
        solution.id = id;
      }

      return {
        solution: addCacheKeys ? annotateWithCacheKeys(solution) : solution,
      };
    } catch (err) {
      return {
        error: fromParseError(err as Error),
      };
    }
  }
}

export function parseStatement(source: string): Parser.ParsedStatement {
  const parsed = parseBlock(source);

  if (parsed.error) return parsed;

  return {
    solution: parsed.solution.args[0],
  };
}

export function parseExpression(source: string): Parser.ParsedExpression {
  const parsed = parseStatement(source);

  if (parsed.error) return parsed;

  if (!isExpression(parsed.solution)) {
    return {
      error: { message: 'Expected expression', isEmptyExpressionError: true },
    };
  }

  return {
    solution: parsed.solution,
  };
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
