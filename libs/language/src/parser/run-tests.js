import assert from 'assert';
import { walkAst, zip } from '../utils';
import { prettyPrintAST } from './utils';
import { parse } from '.';

function cleanSourceMap(ast) {
  walkAst(ast, (node) => {
    delete node.end;
    delete node.start;
  });
}

// If the test places a number in `start` or `end`, assume that's the character index
function simplifySourceMaps(gots, expecteds) {
  if (gots.length !== expecteds.length) {
    return;
  }

  for (const [got, expected] of zip(gots, expecteds)) {
    const simplifiedStart = new Set();
    const simplifiedEnd = new Set();

    walkAst(expected, (node, path) => {
      const pathStr = path.toString();
      if (typeof node.start === 'number') {
        simplifiedStart.add(pathStr);
      }
      if (typeof node.end === 'number') {
        simplifiedEnd.add(pathStr);
      }
    });

    walkAst(got, (node, path) => {
      const pathStr = path.toString();
      if (simplifiedStart.has(pathStr)) {
        node.start = node.start.char;
      }
      if (simplifiedEnd.has(pathStr)) {
        node.end = node.end.char;
      }
    });
  }
}

function getCleanSolution(results, source, sourceMap, ast) {
  assert(results.length === 1);

  const result = results[0];

  const solution = result.solutions[0];

  expect(solution.type).toBe('block');

  if (sourceMap === false) {
    cleanSourceMap(solution);
  }
  simplifySourceMaps(solution.args, ast);

  return solution;
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
    const testFunction = skip ? test.skip : only ? test.only : test;

    testFunction(name, () => {
      let results;
      let parseError;
      try {
        results = parse([{ id: name, source }]);
      } catch (err) {
        parseError = err;
      }

      const resultsWithErrors = results?.filter(
        (result) => result.errors.length > 0
      );
      if ((resultsWithErrors?.length ?? 0) > 0) {
        [parseError] = resultsWithErrors[0].errors;
      }

      if (parseError) {
        if (!expectError) {
          throw parseError;
        } else {
          const testError =
            typeof expectError === 'string'
              ? { message: expectError }
              : expectError;
          expect(parseError).toMatchObject(testError);
        }
      } else {
        if (expectError) {
          throw new Error(`expected error "${expectError}" to occur`);
        }

        const solution = getCleanSolution(results, source, sourceMap, ast);

        try {
          expect(solution.args).toMatchObject(ast);
        } catch (err) {
          console.error(prettyPrintAST(solution));

          throw err;
        }
      }
    });
  }
}
