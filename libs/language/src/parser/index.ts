import nearley from 'nearley';
import { compiledGrammar } from '../grammar';
import { ParserNode } from './types';
import { sourceMapDecorator } from './source-map-decorator';

const grammar = nearley.Grammar.fromCompiled(compiledGrammar);

class BlockParser {
  parser: nearley.Parser;
  chunks: string[] = [];
  sourceDecorator: (node: ParserNode) => AST.Node;

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

    return ((this.parser.results as ParserNode[]).map(
      this.sourceDecorator
    ) as unknown) as Parser.Solution[];
  }
}

function parseBlock(block: Parser.UnparsedBlock): Parser.ParsedBlock {
  const parser = new BlockParser();
  parser.feed(block.source.trimEnd());
  parser.finish();
  const result: Parser.ParsedBlock = {
    id: block.id,
    solutions: parser.solutions,
  };
  return result;
}

export function parse(blocks: Parser.UnparsedBlock[]): Parser.ParsedBlock[] {
  return blocks.map(parseBlock);
}
