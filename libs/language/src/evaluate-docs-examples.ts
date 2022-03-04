/* istanbul ignore file */
import { nanoid } from 'nanoid';
import { Computer, ComputeResponse, deserializeType, InferError } from '.';
import { RuntimeError } from './interpreter';
import { stringifyResult } from './result';
import { getDefined, identity } from './utils';

type EvaluatedDoc = string | { crash: string };

function resultFromComputerResult(
  blockId: string,
  result: ComputeResponse
): string {
  for (const update of result.updates) {
    if (update.blockId === blockId) {
      const error = update.error && update.error.message;
      if (error) {
        return error;
      }
      const { results } = update;
      const lastResult = results[results.length - 1];
      if (lastResult.type.kind === 'type-error') {
        return new InferError(lastResult.type.errorCause).message;
      }
      return stringifyResult(
        lastResult.value,
        deserializeType(lastResult.type),
        identity
      );
    }
  }
  throw new Error(`could not find a result in block ${blockId}`);
}

async function getDocTestString(codeExample: string): Promise<EvaluatedDoc> {
  try {
    const blockId = nanoid();
    const computer = new Computer();
    const result = await computer.compute({
      program: [
        {
          type: 'unparsed-block',
          id: blockId,
          source: codeExample,
        },
      ],
      subscriptions: [blockId],
    });
    if (result.type === 'compute-panic') {
      throw new Error(result.message);
    }

    return resultFromComputerResult(blockId, result);
  } catch (error) {
    if (error instanceof TypeError || error instanceof RuntimeError) {
      return error.message;
    } else {
      const detail = `${codeExample}\n\n${
        (error as Error).stack || (error as Error).message
      }`;
      return {
        crash: `Error in getDocTestString for the following code:\n${detail}`,
      };
    }
  }
}

const loadStdin = async () => {
  let loadedCode = '';
  for await (const data of process.stdin) {
    loadedCode += data;
  }
  return loadedCode;
};

function timeout(ms: number, code: string): Promise<never> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => reject(new Error(`timeout evaluating ${code}`)), ms);
  });
}

async function main() {
  const codeExamples: Record<string, string[]> = JSON.parse(await loadStdin());

  const out: Record<string, EvaluatedDoc[]> = {};
  for (const [file, liveBlocks] of Object.entries(codeExamples)) {
    out[file] = [];
    for (const code of liveBlocks) {
      // eslint-disable-next-line no-await-in-loop
      const evalResult = await Promise.any([
        timeout(10000, code),
        getDocTestString(code),
      ]);
      // eslint-disable-next-line no-await-in-loop
      out[file].push(getDefined(evalResult));
    }
  }

  return out;
}

main()
  .then((result) => {
    console.log(JSON.stringify(result));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
