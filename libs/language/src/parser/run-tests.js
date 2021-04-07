import assert from 'assert';
import { parse } from './';

export function runTests(tests) {
  for (const [name, spec] of Object.entries(tests)) {
    const { source, ast, expectError, skip = false, only = false } = spec;
    let testFunction = skip ? test.skip : only ? test.only : test;

    testFunction(name, () => {
      let results, parseError;
      try {
        results = parse([
          {
            id: name,
            source,
          },
        ]);
      } catch (err) {
        parseError = err;
      }

      if (parseError) {
        if (!expectError) {
          throw parseError;
        } else {
          expect(parseError.message).toMatch(expectError);
        }
      } else {
        if (expectError) {
          throw new Error(`expected error "${expectError}" to occur`);
        }

        assert(results.length === 1);

        const result = results[0];

        if (result.solutions.length === 0) {
          throw new Error(`No solutions found for source "${source}"`);
        }

        if (result.solutions.length > 1) {
          throw new Error(
            `Ambiguous results. Alternatives:\n${result.solutions.map(
              (result) =>
                `Result :\n ${JSON.stringify(result, null, '\t')}\n-------\n`
            )}`
          );
        }

        const solution = result.solutions[0];

        expect(solution.type).toBe('block');

        try {
          expect(solution.args).toStrictEqual(ast);
        } catch (err) {
          console.error(JSON.stringify(results[0].solutions, null, '\t'));
          throw err;
        }
      }
    });
  }
}
