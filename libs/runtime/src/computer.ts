/* eslint @nrwl/nx/enforce-module-boundaries: "off" */
import { produce } from 'immer';
import { parse, run, inferTargetStatement } from '../../language/src';
import { Replica } from './replica';

export class Computer {
  replica: Replica<SyncPadDoc>;
  computationErrors: ComputationError[] | undefined;
  codeBlocks: ComputerCodeBlock[] | undefined;

  constructor(replica: Replica<SyncPadDoc>) {
    this.replica = replica;
    this.reset();
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
        type: null,
        value: null,
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

    if (statementOffset === -1) {
      return {
        errors: this.computationErrors,
        type: null,
        value: null,
      };
    }

    const program = this.codeBlocks.map((block) => block.ast as AST.Block);

    const location = [blockOffset, statementOffset] as [number, number];

    const type = await inferTargetStatement(program, location);
    const value = type.errorCause ? null : await run(program, [location]);

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

  private static getBlockErrors(
    parsedBlock: Parser.ParsedBlock
  ): ComputationError[] {
    if (parsedBlock.errors.length > 0) {
      return parsedBlock.errors.map(
        produce((error: ComputationError) => {
          error.message = 'Error';
        })
      );
    } else if (parsedBlock.solutions.length !== 1) {
      return [
        {
          message: 'Error',
          details:
            parsedBlock.solutions.length === 0
              ? 'no solutions found for code'
              : 'code is ambiguous',
          fileName: parsedBlock.id,
          lineNumber: 0, // TODO
          columnNumber: 0, // TODO
        },
      ];
    } else {
      return [];
    }
  }

  private parseCode() {
    const blocks: ComputerUnparsedBlock[] = [];

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

    this.computationErrors = [];
    this.codeBlocks = [];
    for (const block of parsedBlocks) {
      const errors = Computer.getBlockErrors(block);

      if (errors.length === 0) {
        this.codeBlocks.push({
          id: block.id,
          ast: block.solutions[0],
        });
      } else {
        this.computationErrors.push(...errors);
      }
    }
  }
}

function idAndTextFromElem(elem: Sync.Node): [string, string] {
  const text = elem.children
    .map((child: { text: string }) => child.text)
    .join('\n')
    .trim();

  return [elem.id, text];
}
