import nearley from 'nearley';

import { n } from '../utils';
import { compiledGrammar } from '../grammar';
import { ParserNode } from './types';
import { sourceMapDecorator } from './source-map-decorator';

const grammar = nearley.Grammar.fromCompiled(compiledGrammar);

class BlockParser {
  parser: nearley.Parser;
  chunks: string[] = [];
  sourceDecorator?: (node: ParserNode) => AST.Node;

  constructor() {
    this.parser = new nearley.Parser(grammar);
  }

  feed(chunk: string) {
    this.chunks.push(chunk);
    this.parser.feed(chunk);
  }

  finish() {
    this.parser.finish();
    this.sourceDecorator = sourceMapDecorator(this.chunks.join(''));
    this.chunks = [];
  }

  get solutions(): Parser.Solution[] {
    if (this.sourceDecorator === undefined) {
      throw new Error('Not yet finished');
    }

    return (this.parser.results as ParserNode[]).map(
      this.sourceDecorator
    ) as unknown as Parser.Solution[];
  }
}

export function parseBlock({
  source,
  id,
}: Parser.UnparsedBlock): Parser.ParsedBlock {
  const ensureId = (block: AST.Block) => ({ ...block, id });

  if (source.trim() === '') {
    return {
      id,
      solutions: [ensureId(n('block'))],
      errors: [],
    };
  } else {
    const parser = new BlockParser();
    parser.feed(source.trimEnd());
    parser.finish();

    return {
      id,
      solutions: parser.solutions.map((block) => ensureId(block)),
      errors: [],
    };
  }
}

export function parse(blocks: Parser.UnparsedBlock[]): Parser.ParsedBlock[] {
  return blocks.map((block) => {
    try {
      return parseBlock(block);
    } catch (err) {
      return {
        id: block.id,
        solutions: [],
        errors: [fromParseError(block.id, err)],
      };
    }
  });
}

function fromParseError(blockId: string, err: Error): Parser.ParserError {
  const messageParts = err.message.split('\n');
  const mainMessage = messageParts[0];

  const matches = mainMessage.match(/Syntax error at line (\d) col (\d)/);

  return {
    message: matches === null ? err.message : matches[0],
    details: messageParts.slice(2).join('\n'),
    fileName: blockId,
    lineNumber: Number(matches === null ? 0 : matches[1]),
    columnNumber: Number(matches === null ? 0 : matches[2]),
  };
}
