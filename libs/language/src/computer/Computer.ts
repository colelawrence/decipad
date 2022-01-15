import { inferStatement } from '../infer';
import { evaluate as evaluateStatement, RuntimeError } from '../interpreter';

import {
  AST,
  ExternalDataMap,
  AutocompleteName,
  serializeType,
  serializeResult,
} from '..';
import { captureException } from '../reporting';
import {
  ComputePanic,
  ValueLocation,
  ComputeResponse,
  IdentifiedResult,
  InBlockResult,
  IdentifiedBlock,
  ComputeRequest,
  OptionalValueLocation,
} from './types';
import { ParseRet, updateParse } from './parse';
import { ComputationRealm } from './ComputationRealm';
import { build as t } from '../type';
import { getAllBlockLocations, getGoodBlocks, getStatement } from './utils';
import { anyMappingToMap } from '../utils';
import { validateResult } from '../result';

/*
 - Skip cached stuff
 - Infer this statement
 - Evaluate the statement if it's not a type error
 */
const computeStatement = async (
  program: AST.Block[],
  location: ValueLocation,
  realm: ComputationRealm
): Promise<InBlockResult> => {
  let result = realm.getFromCache(location);

  if (result == null) {
    const [blockId, statementIndex] = location;
    const statement = getStatement(program, location);
    const valueType = await inferStatement(realm.inferContext, statement);

    let value = null;

    if (!(valueType.errorCause != null && !valueType.functionness)) {
      const evaluated = await evaluateStatement(
        realm.interpreterRealm,
        statement
      );
      value = evaluated.getData();
    }

    validateResult(valueType, value);

    result = { blockId, statementIndex, ...serializeResult(valueType, value) };
  }

  realm.addToCache(location, result);
  return result;
};

const resultsToUpdates = (results: InBlockResult[]) => {
  const ret: IdentifiedResult[] = [];

  for (const result of results) {
    const { blockId } = result;
    let identifiedResult = ret.find((r) => r.blockId === blockId);

    if (identifiedResult == null) {
      identifiedResult = {
        blockId,
        isSyntaxError: false,
        results: [],
      };
      ret.push(identifiedResult);
    }

    identifiedResult.results.push(result);
  }

  return ret;
};

export const resultFromError = (
  error: Error,
  location: ValueLocation
): InBlockResult => {
  const [blockId, statementIndex] = location;

  const message = error.message.replace(
    /^panic: (.+)$/,
    'Internal Error: $1. Please contact support'
  );

  if (!(error instanceof RuntimeError)) {
    // Not a user-facing error, so let's hide internal details
    console.error(error);
    captureException(error);
  }

  return {
    blockId,
    statementIndex,
    ...serializeResult(t.impossible(message), null),
  };
};

export const computeProgram = async (
  program: AST.Block[],
  realm: ComputationRealm
): Promise<InBlockResult[]> => {
  const results: InBlockResult[] = [];

  for (const location of getAllBlockLocations(program)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await computeStatement(program, location, realm);
      results.push(result);
    } catch (err) {
      results.push(resultFromError(err as Error, location));
    }
  }

  return results;
};

export class Computer {
  private previouslyParsed: ParseRet[] = [];
  private previousExternalData: ExternalDataMap = new Map();
  private computationRealm = new ComputationRealm();

  private ingestComputeRequest({ program, externalData }: ComputeRequest) {
    const newExternalData = anyMappingToMap(externalData ?? new Map());
    const newParse = updateParse(program, this.previouslyParsed);

    this.computationRealm.evictCache({
      oldBlocks: getGoodBlocks(this.previouslyParsed),
      newBlocks: getGoodBlocks(newParse),
      oldExternalData: this.previousExternalData,
      newExternalData,
    });

    this.computationRealm.setExternalData(newExternalData);
    this.previousExternalData = newExternalData;
    this.previouslyParsed = newParse;

    return newParse;
  }

  async compute(req: ComputeRequest): Promise<ComputeResponse | ComputePanic> {
    /* istanbul ignore catch */
    try {
      const blocks = this.ingestComputeRequest(req);
      const goodBlocks = getGoodBlocks(blocks);
      const computeResults = await computeProgram(
        goodBlocks,
        this.computationRealm
      );

      const updates: IdentifiedResult[] = [];

      for (const block of blocks) {
        if (block.type === 'identified-error') {
          updates.push({
            blockId: block.id,
            isSyntaxError: true,
            error: block.error,
            results: [],
          });
        }
      }

      updates.push(...resultsToUpdates(computeResults));

      return {
        type: 'compute-response',
        updates,
        indexLabels: this.computationRealm.getIndexLabels(),
      };
    } catch (error) {
      console.error(error);
      this.reset();
      return {
        type: 'compute-panic',
        message: (error as Error).message,
      };
    }
  }

  /**
   * Reset computer's state -- called when it panicks
   */
  reset() {
    this.previouslyParsed = [];
    this.previousExternalData = new Map();
    this.computationRealm = new ComputationRealm();
  }

  /**
   * Get names for the autocomplete, and information about them
   */
  async getNamesDefinedBefore([blockId, stmtIdx]: ValueLocation): Promise<
    AutocompleteName[]
  > {
    const program = getGoodBlocks(this.previouslyParsed);

    // Our search stops at this statement
    const findUntil = program.find((b) => b.id === blockId)?.args[stmtIdx];
    if (!findUntil) return [];

    const { nodeTypes } = this.computationRealm.inferContext;
    function* findNames(): Iterable<AutocompleteName> {
      for (const block of program) {
        for (const statement of block.args) {
          if (statement === findUntil) return;

          const type = nodeTypes.get(statement);

          if (statement.type === 'assign' && type) {
            yield {
              kind: 'variable',
              type: serializeType(type),
              name: statement.args[0].args[0],
            };
          }

          if (statement.type === 'function-definition' && type) {
            yield {
              kind: 'function',
              type: serializeType(type),
              name: statement.args[0].args[0],
            };
          }
        }
      }
    }

    return Array.from(findNames());
  }

  /**
   * Take a cursor position in "editor space" [blockId, lineNo]
   * and turn it into "language space" [blockId, statementIndex]
   */
  cursorPosToValueLocation(
    cursorPos?: ValueLocation | null
  ): OptionalValueLocation | null {
    if (cursorPos == null) return null;

    const [blockId, lineNo] = cursorPos;

    const block = (
      this.previouslyParsed.find(
        (block) => block.id === blockId
      ) as IdentifiedBlock
    )?.block;

    if (block == null) return null;

    const statementIndex = block.args.findIndex(
      ({ start, end }) =>
        start && start.line <= lineNo && end && end.line >= lineNo
    );

    return statementIndex !== -1 ? [blockId, statementIndex] : [blockId, null];
  }

  getStatement(blockId: string, statementIndex: number): AST.Statement | null {
    const block = (
      this.previouslyParsed.find(
        (block) => block.id === blockId
      ) as IdentifiedBlock
    )?.block;

    return block?.args[statementIndex] ?? null;
  }

  isLiteralValueOrAssignment(stmt: AST.Statement | null): boolean {
    return (
      stmt != null &&
      (stmt.type === 'literal' ||
        (stmt.type === 'assign' && stmt.args[1].type === 'literal'))
    );
  }
}
