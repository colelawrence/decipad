import { n, c, l } from "../utils";

import { run } from "./index";

it("wraps getTensorWithTargets, evaluates and returns", async () => {
  const basicProgram = [
    n("block", c("+", l(1), l(1))),
    n("block", n("assign", n("def", "A"), l(42))),
  ];

  expect(await run(basicProgram, ["A"])).toEqual(
    [42]
  );
});

it("Gets specific statement", async () => {
  const basicProgram = [n("block", c("+", l(1), l(1)))];

  expect(await run(basicProgram, [[0, 0]])).toEqual(
    [2]
  );
});

it('deals with arrays', async () => {
})
