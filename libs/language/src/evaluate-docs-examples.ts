import { stringifyResult } from './repl';
import { runCode } from '.';

async function getDocTestString(codeExample: string) {
  try {
    const { value, type } = await runCode(codeExample);
    return stringifyResult(value, type, (x) => x);
  } catch (error) {
    if (error instanceof TypeError) {
      return error.message;
    } else {
      console.error('Error in getDocTestString for the followingCode:');
      console.error(codeExample);
      throw error;
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
  const codeExamples: string[] = JSON.parse(await loadStdin());

  const out = [];
  for (const code of codeExamples) {
    // eslint-disable-next-line no-await-in-loop
    out.push(await getDocTestString(code));
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
