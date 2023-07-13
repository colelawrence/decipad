import { parseBlockOrThrow, prettyPrintAST, runCode } from '..';

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
    try {
      await check(`2 ${first} 3 ${second} 5`);
    } catch (e) {
      console.log(`parsing '2 ${first} 3 ${second} 5' failed`);
      throw e;
    }
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

const prettyParse = (s: string) => {
  return prettyPrintAST(parseBlockOrThrow(s));
};

describe('operator/implicit mul precedence', () => {
  it("should parse '1 * 2' correctly", () => {
    expect(prettyParse('1 * 2')).toMatchInlineSnapshot(`
          "(block
            (* 1 2))"
      `);
  });

  it("should parse '1 / 2' correctly", () => {
    expect(prettyParse('1 / 2')).toMatchInlineSnapshot(`
      "(block
        (/ 1 2))"
    `);
  });

  it("should parse '1 / 2 / 3' correctly", () => {
    expect(prettyParse('1 / 2 / 3')).toMatchInlineSnapshot(`
      "(block
        (/ (/ 1 2) 3))"
    `);
  });

  it("should parse '1^2kg' correctly", () => {
    expect(prettyParse('1^2kg')).toMatchInlineSnapshot(`
          "(block
            (implicit* (^ 1 2) (ref kg)))"
      `);
  });

  it("should parse 'kg' correctly", () => {
    expect(prettyParse('kg')).toMatchInlineSnapshot(`
          "(block
            (ref kg))"
      `);
  });

  it("should parse '1/2 kg' correctly", () => {
    expect(prettyParse('1/2 kg')).toMatchInlineSnapshot(`
      "(block
        (implicit* (/ 1 2) (ref kg)))"
    `);
  });

  it("should parse 'kg/2' correctly", () => {
    expect(prettyParse('kg/2')).toMatchInlineSnapshot(`
          "(block
            (/ (ref kg) 2))"
      `);
  });

  it("should parse '2 / 3 * 5' correctly", () => {
    expect(prettyParse('2 / 3 * 5')).toMatchInlineSnapshot(`
      "(block
        (* (/ 2 3) 5))"
    `);
  });

  it("should parse '2 / 3kg * 5' correctly", () => {
    expect(prettyParse('2 / 3kg * 5')).toMatchInlineSnapshot(`
      "(block
        (* (implicit* (/ 2 3) (ref kg)) 5))"
    `);
  });

  it("should parse '2 / 3 ** 5' correctly", () => {
    expect(prettyParse('2 / 3 ** 5')).toMatchInlineSnapshot(`
      "(block
        (/ 2 (** 3 5)))"
    `);
  });

  it("should parse '2 * 3 / 5' correctly", () => {
    expect(prettyParse('2 * 3 / 5')).toMatchInlineSnapshot(`
      "(block
        (/ (* 2 3) 5))"
    `);
  });

  it("should parse '2 * 3 / 5 / 4' correctly", () => {
    expect(prettyParse('2 * 3 / 5 / 4')).toMatchInlineSnapshot(`
      "(block
        (/ (/ (* 2 3) 5) 4))"
    `);
  });

  it("should parse '2 * 3 / 5 / 4 /3' correctly", () => {
    expect(prettyParse('2 * 3 / 5 / 4 / 3')).toMatchInlineSnapshot(`
      "(block
        (/ (/ (/ (* 2 3) 5) 4) 3))"
    `);
  });

  it("should parse 'kg/2/3' correctly", () => {
    expect(prettyParse('kg/2/3')).toMatchInlineSnapshot(`
          "(block
            (/ (/ (ref kg) 2) 3))"
      `);
  });

  it("should parse '1kg/2/3' correctly", () => {
    expect(prettyParse('1kg/2/3')).toMatchInlineSnapshot(`
          "(block
            (/ (/ (implicit* 1 (ref kg)) 2) 3))"
      `);
  });

  it("should parse '3 miles / 2 hours' correctly", () => {
    expect(prettyParse('3 miles / 2 hours')).toMatchInlineSnapshot(`
          "(block
            (/ (implicit* 3 (ref miles)) (implicit* 2 (ref hours))))"
      `);
  });

  it("should parse '1/kg' correctly", () => {
    expect(prettyParse('1/kg')).toMatchInlineSnapshot(`
          "(block
            (/ 1 (ref kg)))"
      `);
  });

  it("should parse '1/ kg / s' correctly", () => {
    expect(prettyParse('1/ kg / s')).toMatchInlineSnapshot(`
          "(block
            (/ (/ 1 (ref kg)) (ref s)))"
      `);
  });

  it("should parse '1 + 2 / 3' correctly", () => {
    expect(prettyParse('1 + 2 / 3')).toMatchInlineSnapshot(`
      "(block
        (+ 1 (/ 2 3)))"
    `);
  });

  it("should parse '2 ** 5 / 42' correctly", () => {
    expect(prettyParse('2 ** 5 / 42')).toMatchInlineSnapshot(`
          "(block
            (/ (** 2 5) 42))"
      `);
  });

  it("should parse '55 mod 2' correctly", () => {
    expect(prettyParse('55 mod 2')).toMatchInlineSnapshot(`
          "(block
            (mod 55 2))"
      `);
  });

  it("should parse '4 miles/hour * 2' correctly", () => {
    expect(prettyParse('4 miles/hour * 2')).toMatchInlineSnapshot(`
          "(block
            (* (/ (implicit* 4 (ref miles)) (ref hour)) 2))"
      `);
  });

  it('should parse `10*meter/sec` correctly', () => {
    expect(prettyParse(`10*meter/sec`)).toMatchInlineSnapshot(`
          "(block
            (/ (* 10 (ref meter)) (ref sec)))"
      `);
  });

  it('should parse `10*meter/11` correctly', () => {
    expect(prettyParse(`10*meter/11`)).toMatchInlineSnapshot(`
          "(block
            (/ (* 10 (ref meter)) 11))"
      `);
  });

  it('should parse `kg*meter/sec` correctly', () => {
    expect(prettyParse(`kg*meter/sec`)).toMatchInlineSnapshot(`
          "(block
            (/ (* (ref kg) (ref meter)) (ref sec)))"
      `);
  });

  it('should parse `kg*1/sec` correctly', () => {
    expect(prettyParse(`kg*1/sec`)).toMatchInlineSnapshot(`
          "(block
            (/ (* (ref kg) 1) (ref sec)))"
      `);
  });

  it('should parse `2*1/sec` correctly', () => {
    expect(prettyParse(`2*1/sec`)).toMatchInlineSnapshot(`
          "(block
            (/ (* 2 1) (ref sec)))"
      `);
  });

  it('should parse `10 kg*meter/sec^2 in newtons` correctly', () => {
    expect(prettyParse(`10 kg*meter/sec^2 in newtons`)).toMatchInlineSnapshot(`
          "(block
            (directive as (/ (* (implicit* 10 (ref kg)) (ref meter)) (^ (ref sec) 2)) (ref newtons)))"
      `);
  });

  it('should parse `psi + newton/inch^2` correctly', () => {
    expect(prettyParse(`psi + newton/inch^2`)).toMatchInlineSnapshot(`
          "(block
            (+ (ref psi) (/ (ref newton) (^ (ref inch) 2))))"
      `);
  });

  it("should parse '1 / Animals.Speed' correctly", () => {
    expect(prettyParse('1 / Animals.Speed')).toMatchInlineSnapshot(`
          "(block
            (/ 1 (prop (ref Animals).Speed)))"
      `);
  });

  it("should parse 'mile^2/s' correctly", () => {
    expect(prettyParse('mile^2/s')).toMatchInlineSnapshot(`
      "(block
        (/ (^ (ref mile) 2) (ref s)))"
    `);
  });
  it("should parse 'mile^2/2' correctly", () => {
    expect(prettyParse('mile^2/2')).toMatchInlineSnapshot(`
      "(block
        (/ (^ (ref mile) 2) 2))"
    `);
  });

  it("should parse 'mile^s/s' correctly", () => {
    expect(prettyParse('mile^s/s')).toMatchInlineSnapshot(`
      "(block
        (/ (^ (ref mile) (ref s)) (ref s)))"
    `);
  });

  it("should parse 'mile^s/2' correctly", () => {
    expect(prettyParse('mile^s/2')).toMatchInlineSnapshot(`
      "(block
        (/ (^ (ref mile) (ref s)) 2))"
    `);
  });

  it("should parse '10 s/kmeter^2 in kmeter^2/s' correctly", () => {
    expect(prettyParse('10 s/kmeter^2 in kmeter^2/s')).toMatchInlineSnapshot(`
      "(block
        (directive as (/ (implicit* 10 (ref s)) (^ (ref kmeter) 2)) (/ (^ (ref kmeter) 2) (ref s))))"
    `);
  });
});

async function check(sourceCode: string) {
  const codeMsg = () =>
    [`\`${sourceCode}\``, prettyPrintAST(parseBlockOrThrow(sourceCode))].join(
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
