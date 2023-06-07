/* istanbul ignore file */
import stringify from 'json-stringify-safe';
import { formatError, formatResult } from '@decipad/format';
import maxBy from 'lodash.maxby';
import {
  deserializeType,
  materializeOneResult,
  RuntimeError,
} from '@decipad/language';
import { getDefined } from '@decipad/utils';

import {
  Computer,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
} from '.';
import { createProgramFromMultipleStatements } from './computer/parseUtils';

type EvaluatedDoc = string | { crash: string };

const DEFAULT_LOCALE = 'en-US';

export const getMaxIdObject = (
  objects: Readonly<IdentifiedError | IdentifiedResult>[]
): Readonly<IdentifiedError | IdentifiedResult> | undefined => {
  return maxBy(objects, (obj) => Number(obj.id.split('_')[0]));
};

async function resultFromComputerResult(
  result: NotebookResults
): Promise<string> {
  for (const update of Object.values(result.blockResults)) {
    if (update.error) {
      return update.error.message;
    }
  }

  const lastResult = getMaxIdObject(Object.values(result.blockResults))?.result;
  if (!lastResult) {
    throw new Error(`could not find a result`);
  }

  if (lastResult.type.kind === 'type-error') {
    return formatError(DEFAULT_LOCALE, lastResult.type.errorCause);
  }

  return formatResult(
    DEFAULT_LOCALE,
    lastResult.value && (await materializeOneResult(lastResult.value)),
    deserializeType(lastResult.type)
  );
}

async function getDocTestString(codeExample: string): Promise<EvaluatedDoc> {
  try {
    const program = createProgramFromMultipleStatements(codeExample);
    const computer = new Computer();
    const result = await computer.computeRequest({ program });
    if (result == null) {
      throw new Error('compute panic');
    }

    return resultFromComputerResult(result);
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

async function timeout(ms: number, code: string): Promise<never> {
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
    console.log(stringify(result));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
