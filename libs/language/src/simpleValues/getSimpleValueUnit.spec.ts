import { expect, it } from 'vitest';
import { decilang, prettyPrintAST } from '..';
import type { SimpleValueAST } from './common';
import { getSimpleValueUnit } from './getSimpleValueUnit';

const snapshot = (exp?: SimpleValueAST | '%') =>
  exp === '%' ? '%' : exp ? prettyPrintAST(exp) : undefined;

it('gets the unit part of the AST', () => {
  expect(getSimpleValueUnit(decilang<SimpleValueAST>`1`)).toMatchInlineSnapshot(
    `undefined`
  );

  expect(
    getSimpleValueUnit(decilang<SimpleValueAST>`1%`)
  ).toMatchInlineSnapshot(`"%"`);

  expect(getSimpleValueUnit(decilang<SimpleValueAST>`$10/hour`))
    .toMatchInlineSnapshot(`
    {
      "args": [
        {
          "args": [
            "/",
          ],
          "type": "funcref",
        },
        {
          "args": [
            {
              "args": [
                "$",
              ],
              "end": {
                "char": 0,
                "column": 1,
                "line": 1,
              },
              "start": {
                "char": 0,
                "column": 1,
                "line": 1,
              },
              "type": "ref",
            },
            {
              "args": [
                "hour",
              ],
              "end": {
                "char": 7,
                "column": 8,
                "line": 1,
              },
              "start": {
                "char": 4,
                "column": 5,
                "line": 1,
              },
              "type": "ref",
            },
          ],
          "type": "argument-list",
        },
      ],
      "type": "function-call",
    }
  `);

  expect(
    snapshot(getSimpleValueUnit(decilang<SimpleValueAST>`10 meters`))
  ).toMatchInlineSnapshot(`"(ref meters)"`);

  expect(
    snapshot(getSimpleValueUnit(decilang<SimpleValueAST>`10 meters / second`))
  ).toMatchInlineSnapshot(`"(/ (ref meters) (ref second))"`);

  expect(
    snapshot(
      getSimpleValueUnit(decilang<SimpleValueAST>`10 meters ** 2 / second`)
    )
  ).toMatchInlineSnapshot(`"(/ (** (ref meters) 2) (ref second))"`);

  expect(
    snapshot(getSimpleValueUnit(decilang<SimpleValueAST>`$10`))
  ).toMatchInlineSnapshot(`"(ref $)"`);
});
