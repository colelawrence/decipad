import { SyncDoc, Node } from "./model";
import { docFromContext } from "./utils/doc-from-context";
import { parse } from "../parser";
import { run } from "../interpreter";
import { inferTargetStatement } from "../infer";

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

  async resultAt(blockId: string, line: number): Promise<Result.Value> {
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

    const result = (await run(program, [location])).get(location);

    let returnResult: Result.Value;

    if (typeof result === "number") {
      // TODO: we only support number results for now
      returnResult = {
        type: "number",
        value: result,
        units: type.unit as AST.Unit[],
      };
    }

    return returnResult;
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

    for (const elem of doc as Node[]) {
      if (elem.type !== "code_block") {
        continue;
      }
      const [id, source] = idAndTextFromElem(elem);
      if (id === undefined) {
        throw new Error("every code block needs an id");
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
          message: "no solutions found for code",
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

function idAndTextFromElem(elem: any): [string, string] {
  const textElem = elem.children[0];
  let text = textElem && textElem.text;
  if (text) {
    text = text.toString().trim();
  }

  return [elem.id, text];
}
