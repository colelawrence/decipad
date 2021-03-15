import { l, funcDef, n, c } from "../utils";

import { getComputationTargets } from "./getComputationTargets";
import { blocks } from "./testFixtures";

it("gets a set of computation targets by expanding them", () => {
  expect(getComputationTargets(blocks)).toEqual(
    new Map<string | number | [number, number], AST.Expression | null>([
      ["b", l(1)],
      [[0, 0], l(1)],
      [0, n("ref", "b")],
      ["a", l(3)],
      [[1, 0], l(3)],
      [[1, 1], n("ref", "b")],
      [1, null], // functions don't get returned here
    ])
  );
});

it("supports functions too", () => {
  const blocksWithFunctions = [
    n("block", n("assign", n("def", "ext"), l(1))),
    n("block", funcDef("func", ["a"], c("+", n("ref", "a"), n("ref", "ext")))),
    n("block", n("assign", n("def", "result"), c("func", l(2)))),
    n("block", n("ref", "result")),
  ];

  expect(getComputationTargets(blocksWithFunctions)).toEqual(
    new Map<string | number | [number, number], AST.Expression | null>([
      ["ext", l(1)],
      [[0, 0], l(1)],
      [0, n("ref", "ext")],
      [1, null],
      ["result", c("+", l(2), n("ref", "ext"))],
      [[2, 0], c("+", l(2), n("ref", "ext"))],
      [2, n("ref", "result")],
      [3, n("ref", "result")],
      [[3, 0], n("ref", "result")],
    ])
  );
});
