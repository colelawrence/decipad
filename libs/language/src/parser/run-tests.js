import assert from 'assert';
import { walk } from '../utils';
import { prettyPrintAST } from './utils';
import { parse } from './';

function cleanSourceMap(ast) {
  walk(ast, (node) => {
    delete node.end;
    delete node.start;
  });
}

export function runTests(tests) {
  for (const [name, spec] of Object.entries(tests)) {
    const {
      source,
      ast,
      expectError,
      sourceMap = true,
      skip = false,
      only = false,
    } = spec;
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

      const resultsWithErrors = results?.filter(
        (result) => result.errors.length > 0
      );
      if ((resultsWithErrors?.length ?? 0) > 0) {
        parseError = resultsWithErrors[0].errors[0];
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
              (solution) => `Result :\n${prettyPrintAST(solution)}\n-------\n`
            )}`
          );
        }

        const solution = result.solutions[0];

        expect(solution.type).toBe('block');

        if (sourceMap === false) {
          cleanSourceMap(solution);
        }

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
