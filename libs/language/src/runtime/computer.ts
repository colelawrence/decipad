import { Element, Text } from 'slate';
import { inferTargetStatement } from '../infer';
import { run } from '../interpreter';
import { parse } from '../parser';
import { SyncDoc } from './model';
import { docFromContext } from './utils/doc-from-context';

interface CodeBlock {
  id: string;
  ast: AST.Node;
}
interface ParseError {
  message: string;
  blockId: string;
  line: number;
  column: number;
}

interface ParseResult {
  ok: boolean;
  errors: ParseError[];
}

interface TypeInferResult {
  ok: boolean;
  errors: TypeInferError[];
}

interface TypeInferError {
  message: string;
  blockId: string;
  line: number;
  column: number;
}

interface ComputeResult {
  ok: boolean;
  parseErrors: ParseError[];
  typeInferErrors: TypeInferError[];
}

export class Computer {
  dirty = false;
  parseResult: ParseResult;
  context: SyncDoc;
  codeBlocks: CodeBlock[];

  setContext(context: SyncDoc) {
    this.dirty = true;
    this.context = context;
  }

  async resultAt(blockId: string, line: number): Promise<Result> {
    let inBlock: AST.Block | undefined;
    let blockOffset = -1;
    for (const block of this.codeBlocks) {
      blockOffset++;
      if (block.id === blockId) {
        inBlock = block.ast as AST.Block;
        break;
      }
    }

    if (inBlock === undefined) {
      throw new Error(`no block with id ${blockId} found`);
    }

    let statementOffset = -1;
    for (const stmt of inBlock.args) {
      statementOffset++;
      if (stmt.start.line >= line && stmt.end.line <= line) {
        break;
      }
    }

    const program = this.codeBlocks.map((block) => block.ast as AST.Block);

    const location = [blockOffset, statementOffset] as [number, number];

    const type = inferTargetStatement(program, location);
    const value = await run(program, [location]);

    return {
      type,
      value,
    };
  }

  compute(): ComputeResult {
    const parseResult = this.parse();
    if (!parseResult.ok) {
      return {
        ok: false,
        parseErrors: parseResult.errors,
        typeInferErrors: [],
      };
    }

    const typeInferResult = this.typeInfer();
    if (!typeInferResult.ok) {
      return {
        ok: false,
        parseErrors: [],
        typeInferErrors: typeInferResult.errors,
      };
    }

    return {
      ok: true,
      parseErrors: [],
      typeInferErrors: [],
    };
  }

  parse(): ParseResult {
    let result;
    if (this.dirty) {
      result = this._parse();
    } else {
      result = this.parseResult;
    }
    this.parseResult = result;
    this.dirty = false;
    return result;
  }

  _parse(): ParseResult {
    const doc = docFromContext(this.context);

    const blocks: Parser.UnparsedBlock[] = [];

    for (const elem of doc as EditorCodeBlock[]) {
      if (elem.type !== 'code_block') {
        continue;
      }
      const [id, source] = idAndTextFromElem(elem);
      if (id === undefined) {
        throw new Error('every code block needs an id');
      }

      blocks.push({ id, source });
    }

    let parsedBlocks: Parser.ParsedBlock[];
    try {
      parsedBlocks = parse(blocks);
    } catch (err) {
      return {
        ok: false,
        errors: [err],
      };
    }

    const parseResult: ParseResult = {
      ok: true,
      errors: [],
    };

    this.codeBlocks = parsedBlocks.map((parsedBlock) => {
      const solutions = parsedBlock.solutions;
      if (solutions.length === 0) {
        parseResult.ok = false;
        parseResult.errors.push({
          message: 'no solutions found for code',
          blockId: parsedBlock.id,
          line: 0, // TODO
          column: 0, // TODO
        });
      } else if (solutions.length > 1) {
        parseResult.ok = false;
        parseResult.errors.push({
          message: `code is ambiguous`,
          blockId: parsedBlock.id,
          line: 0, // TODO
          column: 0, // TODO
        });
      }
      return {
        id: parsedBlock.id,
        ast: solutions[0],
        result: undefined,
      };
    });

    return parseResult;
  }

  typeInfer(): TypeInferResult {
    return {
      ok: true,
      errors: [],
    };
  }
}

interface EditorCodeBlockLine extends Text {
  text: string;
  result: Result;
}

interface EditorCodeBlock extends Element {
  type: 'code_block';
  id: string;
  children: EditorCodeBlockLine[];
}

function idAndTextFromElem(elem: EditorCodeBlock): [string, string] {
  const text = elem.children
    .map((child: { text: string }) => child.text)
    .join('\n')
    .trim();

  return [elem.id, text];
}
