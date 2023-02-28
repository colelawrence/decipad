import { decilang, prettyPrintAST } from '..';
import { SimpleValueAST } from './common';
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

  expect(
    getSimpleValueUnit(decilang<SimpleValueAST>`$10/hour`)
  ).toMatchInlineSnapshot(`(/ (ref $) (ref hour))`);

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
