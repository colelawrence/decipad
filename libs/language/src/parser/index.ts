import nearley from 'nearley';

import { n } from '../utils';
import * as AST from './ast-types';
import * as Parser from './parser-types';
import { compiledGrammar } from '../grammar';
import { tokenizer, BracketCounter } from '../grammar/tokenizer';
import { ParserNode } from './types';
import { sourceMapDecorator } from './source-map-decorator';
import { prettyPrintAST } from '..';

export { AST, Parser, n };

const grammar = nearley.Grammar.fromCompiled(compiledGrammar);

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
      const parser = new nearley.Parser(grammar);
      parser.feed(source.trimEnd());
      parser.finish();

      const solutions = (parser.results as ParserNode[])
        .map(sourceMapDecorator(source))
        .map(ensureId);

      if (solutions.length > 1) {
        solutions.forEach((solution) => {
          console.error(prettyPrintAST(solution));
        });

        // If this ever happens, it's a problem with the grammar
        throw new Error('panic: multiple solutions');
      }

      if (solutions.length === 0) {
        throw new Error('No solutions');
      }

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
  return {
    blockId,
    message: err.message,
    token: (err as unknown as { token?: moo.Token }).token,
  };
}

function validateBrackets(source: string) {
  const counter = new BracketCounter();
  for (const token of tokenizer.reset(source)) {
    counter.feed(token);
  }
  counter.finalize();
  return counter.validationError;
}
