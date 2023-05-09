import { runCode, serializeResult } from '@decipad/language';
import { formatResultPreview } from './formatResultPreview';

const testCode = async (source: string) => {
  const { type, value } = await runCode(source);

  return serializeResult(type, value);
};

it('can summarize longer lists', async () => {
  expect(
    formatResultPreview(await testCode('[1, 2, 3]'))
  ).toMatchInlineSnapshot(`"column of number"`);

  expect(
    formatResultPreview(
      await testCode('["Hewwo", "UwU", "Is it me you\'re looking for", "UwU"]')
    )
  ).toMatchInlineSnapshot(`"column of string"`);
});

it('shows ranges', async () => {
  expect(
    formatResultPreview(await testCode('range(1 .. 10)'))
  ).toMatchInlineSnapshot(`"range(1 through 10)"`);
});

it('displays type errors', async () => {
  expect(formatResultPreview(await testCode('1 meter + 1 second'))).toMatch(
    /unit|second|meter/i
  );
});

it('displays numbers with units', async () => {
  expect(
    formatResultPreview(await testCode('1 gigasecond'))
  ).toMatchInlineSnapshot(`"1 gigasecond"`);
});

it('random types', async () => {
  expect(formatResultPreview(await testCode(''))).toMatchInlineSnapshot(
    `"nothing"`
  );
  expect(formatResultPreview(await testCode('true'))).toMatchInlineSnapshot(
    `"true"`
  );
  expect(
    formatResultPreview(await testCode('date(2020)'))
  ).toMatchInlineSnapshot(`"date"`);
  expect(formatResultPreview(await testCode('F(X) = 1'))).toMatchInlineSnapshot(
    `"function"`
  );
});
