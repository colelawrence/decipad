import { zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { walkAst } from '@decipad/language-utils';
import { parseBlock } from '.';
import { prettyPrintAST } from './utils';
import { test, expect } from 'vitest';

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

function getCleanSolution(solution, source, sourceMap, ast) {
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
      const { solution, error } = parseBlock(source);

      if (error) {
        if (!expectError) {
          throw error;
        } else {
          const testError =
            typeof expectError === 'string'
              ? { message: expectError }
              : expectError;
          expect(error).toMatchObject(testError);
        }
      } else {
        if (expectError) {
          throw new Error(`expected error "${expectError}" to occur`);
        }

        const cleanSolution = getCleanSolution(
          solution,
          source,
          sourceMap,
          ast
        );

        try {
          expect(cleanSolution.args).toMatchObject(ast);
        } catch (err) {
          console.error(prettyPrintAST(cleanSolution));

          throw err;
        }
      }
    });
  }
}
