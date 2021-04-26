/* eslint @nrwl/nx/enforce-module-boundaries: "off" */
import { parse, run, inferTargetStatement } from '../../language/src';
import { Replica } from './replica';

export class Computer {
  replica: Replica<SyncPadDoc>;
  computationErrors: ComputationError[] | undefined;
  codeBlocks: ComputerCodeBlock[] | undefined;

  constructor(replica: Replica<SyncPadDoc>) {
    this.replica = replica;
  }

  reset() {
    this.computationErrors = undefined;
    this.codeBlocks = undefined;
  }

  async resultAt(blockId: string, line: number): Promise<ComputationResult> {
    this.compute();
    if (this.computationErrors === undefined) {
      throw new Error('expected errors to be populated after compute');
    }
    if (this.computationErrors.length > 0) {
      return {
        errors: this.computationErrors,
        type: undefined,
        value: undefined,
      };
    }
    if (this.codeBlocks === undefined) {
      throw new Error('expected codeBlocks to be populated after compute');
    }

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
      errors: this.computationErrors,
      type,
      value,
    };
  }

  private compute() {
    if (this.computationErrors === undefined) {
      this.parseCode();
    }
  }

  private parseCode() {
    const blocks: ComputerUnparsedBlock[] = [];
    this.computationErrors = [];

    const doc = this.replica.getValue() as Sync.Node[];

    for (const outerElem of doc) {
      for (const elem of outerElem.children) {
        if (elem.type !== 'code_block') {
          continue;
        }
        const [id, source] = idAndTextFromElem(elem);

        if (!id) {
          throw new Error('Code block should have id');
        }

        blocks.push({ id, source });
      }
    }

    const parsedBlocks = parse(blocks);

    const blocksWithoutErrors = parsedBlocks.filter((block) => {
      if (block.errors.length > 0) {
        for (const error of block.errors) {
          this.computationErrors!.push(error);
        }
        return false;
      }
      return true;
    });

    this.codeBlocks = blocksWithoutErrors.map((parsedBlock) => {
      const solutions = parsedBlock.solutions;
      if (solutions.length === 0) {
        this.computationErrors!.push({
          message: 'no solutions found for code',
          details: '',
          fileName: parsedBlock.id,
          lineNumber: 0, // TODO
          columnNumber: 0, // TODO
        });
      } else if (solutions.length > 1) {
        this.computationErrors!.push({
          message: `code is ambiguous`,
          details: '',
          fileName: parsedBlock.id,
          lineNumber: 0, // TODO
          columnNumber: 0, // TODO
        });
      }
      return {
        id: parsedBlock.id,
        ast: solutions[0],
        result: undefined,
      };
    });
  }
}

function idAndTextFromElem(elem: Sync.Node): [string, string] {
  const text = elem.children
    .map((child: { text: string }) => child.text)
    .join('\n')
    .trim();

  return [elem.id, text];
}
