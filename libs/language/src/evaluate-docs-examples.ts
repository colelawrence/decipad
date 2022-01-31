/* istanbul ignore file */

import { stringifyResult } from './result';
import { runCode } from '.';
import { RuntimeError } from './interpreter';

type EvaluatedDoc = string | { crash: string };
async function getDocTestString(codeExample: string): Promise<EvaluatedDoc> {
  try {
    const { value, type } = await runCode(codeExample);
    return stringifyResult(value, type, (x) => x);
  } catch (error) {
    if (error instanceof TypeError || error instanceof RuntimeError) {
      return error.message;
    } else {
      const detail = `${codeExample}\n\n${error.stack || error.message}`;
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

async function main() {
  const codeExamples: Record<string, string[]> = JSON.parse(await loadStdin());

  const out: Record<string, EvaluatedDoc[]> = {};
  for (const [file, liveBlocks] of Object.entries(codeExamples)) {
    out[file] = [];
    for (const code of liveBlocks) {
      // eslint-disable-next-line no-await-in-loop
      out[file].push(await getDocTestString(code));
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
