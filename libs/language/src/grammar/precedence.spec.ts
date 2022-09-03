import { parseOneBlock, prettyPrintAST, runCode } from '..';

/* eslint-disable no-await-in-loop */
/* eslint-disable jest/expect-expect */

const binops = ['+', '-', '*', '/', '**'];
const comparison = ['>', '<', '>=', '<='];
const logical = ['&&', '||', '==', '!='];

function* combinations(binops: string[], binops2 = binops) {
  for (const firstOp of binops) {
    for (const secondOp of binops2) {
      yield [firstOp, secondOp];
    }
  }
}

const evaluateInLanguage = async (code: string) => (await runCode(code)).value;
const evaluateInJs = (code: string) => globalThis.eval(code);

it('correctly precedes', async () => {
  for (const [first, second] of combinations(binops)) {
    await check(`2 ${first} 3 ${second} 5`);
  }
});

it('correctly precedes comparison ops', async () => {
  for (const [first, second] of combinations(comparison, logical)) {
    await check(`10 ${first} 100 ${second} true`);
    await check(`100 ${first} 10 ${second} true`);
    await check(`10 ${first} 100 ${second} false`);
    await check(`100 ${first} 10 ${second} false`);
  }
  for (const [first, second] of combinations(binops, comparison)) {
    await check(`10 ${first} 100 ${second} 1000`);
    await check(`1000 ${first} 10 ${second} 100`);
    await check(`2 ${first} 3 ${second} 10`);
  }
});

it('correctly precedes logical ops', async () => {
  for (const [first, second] of combinations(logical)) {
    await check(`true ${first} false ${second} true`);
    await check(`false ${first} false ${second} true`);
    await check(`false ${first} false ${second} false`);
    await check(`true ${first} true ${second} false`);
  }
});

async function check(sourceCode: string) {
  const codeMsg = () =>
    [`\`${sourceCode}\``, prettyPrintAST(parseOneBlock(sourceCode))].join(
      '\n\n'
    );

  let langResult = -1;
  let jsResult = -1;
  try {
    langResult = Number(await evaluateInLanguage(sourceCode));
    jsResult = Number(evaluateInJs(sourceCode));
  } catch (e) {
    throw new Error(`${codeMsg()}\ncrashed with:\n${String(e)}`);
  }

  langResult = Math.round(langResult * 10) / 10;
  jsResult = Math.round(jsResult * 10) / 10;

  if (langResult !== jsResult) {
    throw new Error(
      `bad comparison\n${codeMsg()}\nexpected ${jsResult}, got ${langResult}`
    );
  }
}
