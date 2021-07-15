import { inferStatement } from '../infer';
import { evaluate as evaluateStatement } from '../interpreter';

import { AST, Parser } from '..';
import {
  ComputePanic,
  ValueLocation,
  ComputeResponse,
  IdentifiedResult,
  InBlockResult,
  IdentifiedBlock,
  ComputeRequest,
} from './types';
import { ParseRet, updateParse } from './parse';
import { ComputationRealm } from './ComputationRealm';
import { getAllBlockLocations, getGoodBlocks, getStatement } from './utils';

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
    const cached = realm.getFromCache(location);
    if (cached != null) return cached;

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

    result = { blockId, statementIndex, value, valueType };
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

export const computeProgram = async (
  program: AST.Block[],
  realm: ComputationRealm
): Promise<InBlockResult[]> => {
  const results: InBlockResult[] = [];

  for (const location of getAllBlockLocations(program)) {
    const result = await computeStatement(program, location, realm);
    results.push(result);
  }

  return results;
};

export class Computer {
  private previouslyParsed: ParseRet[] = [];
  private computationRealm = new ComputationRealm();

  private ingestNewBlocks(unparsedProgram: Parser.UnparsedBlock[]) {
    const newParse = updateParse(unparsedProgram, this.previouslyParsed);

    this.computationRealm.evictCache(
      getGoodBlocks(this.previouslyParsed),
      getGoodBlocks(newParse)
    );

    this.previouslyParsed = newParse;
    return newParse;
  }

  async compute({
    program,
    subscriptions: _,
  }: ComputeRequest): Promise<ComputeResponse | ComputePanic> {
    /* istanbul ignore catch */
    try {
      const blocks = this.ingestNewBlocks(program);

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
            results: [],
          });
        }
      }

      updates.push(...resultsToUpdates(computeResults));

      return {
        type: 'compute-response',
        updates,
      };
    } catch (error) {
      console.error(error);
      this.reset();
      return {
        type: 'compute-panic',
        message: error.message,
      };
    }
  }

  /**
   * Reset computer's state -- called when it panicks
   */
  reset() {
    this.constructor.call(this);
  }

  /**
   * Take a cursor position in "editor space" [blockId, lineNo]
   * and turn it into "language space" [blockId, statementIndex]
   */
  cursorPosToValueLocation(
    cursorPos?: ValueLocation | null
  ): ValueLocation | null {
    if (cursorPos == null) return null;

    const [blockId, lineNo] = cursorPos;

    const block = (
      this.previouslyParsed.find(
        (block) => block.id === blockId
      ) as IdentifiedBlock
    )?.block;

    if (block == null) return null;

    const statementIndex = block.args.findIndex(
      ({ start, end }) => start?.line >= lineNo && end?.line <= lineNo
    );

    return statementIndex != -1 ? [blockId, statementIndex] : null;
  }
}
