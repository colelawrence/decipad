import { inferStatement } from '../infer';
import { evaluate as evaluateStatement } from '../interpreter';
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
import { IComputationRealm, ComputationRealm } from './ComputationRealm';
import { getEvaluationPlan } from './dependencies';
import { getGoodBlocks, getStatement } from './utils';

const computeStatement = async (
  program: AST.Block[],
  location: ValueLocation,
  realm: IComputationRealm
): Promise<InBlockResult> => {
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

  return { blockId, statementIndex, value, valueType };
};

/*
 - Figure out dependencies from the desired results
 - Infer this program, evaluating only what's a target OR not in CACHE
 - Evaluate this program, only what's (a target OR not in CACHE) AND not a type error
 */
export const computeProgram = async (
  program: AST.Block[],
  subscriptions: string[],
  realm: IComputationRealm
): Promise<IdentifiedResult[]> => {
  const evalPlan = getEvaluationPlan(program, subscriptions, realm);

  const results: IdentifiedResult[] = [];
  const addResult = (result: InBlockResult) => {
    const { blockId } = result;
    let identifiedResult = results.find((r) => r.blockId === result.blockId);

    if (identifiedResult == null) {
      identifiedResult = {
        blockId,
        isSyntaxError: false,
        results: [],
      };
      results.push(identifiedResult);
    }

    identifiedResult.results.push(result);
  };

  for (const location of evalPlan) {
    const result = await computeStatement(program, location, realm);
    realm.addLocToCache(location, result);

    addResult(result);
  }

  return results;
};

export class Computer {
  private previouslyParsed: ParseRet[] = [];
  private computationRealm = new ComputationRealm();

  reset() {
    this.previouslyParsed = [];
    this.computationRealm = new ComputationRealm();
  }

  private ingestNewBlocks(unparsedProgram: Parser.UnparsedBlock[]) {
    const previousBlocks = new Map(
      this.previouslyParsed.map((block) => [block.id, block])
    );

    const [toEvict, newProgram] = updateParse(unparsedProgram, previousBlocks);

    this.computationRealm.evictBlockCache(this.previouslyParsed, toEvict);

    this.previouslyParsed = newProgram;
    return newProgram;
  }

  async compute({
    program,
    subscriptions,
  }: ComputeRequest): Promise<ComputeResponse | ComputePanic> {
    /* istanbul ignore catch */
    try {
      const blocks = this.ingestNewBlocks(program);

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

      const goodBlocks = getGoodBlocks(blocks);

      for (const upd of await computeProgram(
        goodBlocks,
        subscriptions ?? goodBlocks.map((b) => b.id),
        this.computationRealm
      )) {
        updates.push(upd);
      }

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

  // Take a cursor position in "editor space" and turn it into "language space"
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
