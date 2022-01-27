import { n } from '../utils';
import * as AST from './ast-types';
import * as Parser from './parser-types';
import { tokenizer, BracketCounter } from '../grammar/tokenizer';
import { parse as languageParse } from './parser';
import { SyntaxError } from './SyntaxError';

export { AST, Parser, n, SyntaxError };

export function parseBlock({
  source,
  id,
}: Parser.UnparsedBlock): Parser.ParsedBlock {
  const ensureId = (block: AST.Block) => ({ ...block, id });

  if (source.trim() === '') {
    return { id, solutions: [ensureId(n('block'))], errors: [] };
  } else {
    const bracketError = validateBrackets(source);
    if (bracketError) {
      return {
        id,
        solutions: [],
        errors: [{ blockId: id, message: 'Bracket error', bracketError }],
      };
    }

    try {
      const solutions = (languageParse(source.trimEnd()) as AST.Block[]).map(
        ensureId
      );

      return { id, solutions, errors: [] };
    } catch (err) {
      return {
        id,
        solutions: [],
        errors: [fromParseError(id, err as Error)],
      };
    }
  }
}

export function parse(blocks: Parser.UnparsedBlock[]): Parser.ParsedBlock[] {
  return blocks.map((block) => parseBlock(block));
}

function fromParseError(blockId: string, err: Error): Parser.ParserError {
  const resultError: Parser.ParserError = {
    blockId,
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
