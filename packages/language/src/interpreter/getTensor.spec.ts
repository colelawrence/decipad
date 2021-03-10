import * as tf from "@tensorflow/tfjs-core";
import { n, c, l, funcDef } from "../utils";

import { getTensorWithTargets } from "./getTensor";

const testMultiTensors = (
  program: AST.Block[],
  targets: Array<string | number | [blockIdx: number, statementIdx: number]>
): number[] => {
  const tensorWithTargets = tf.tidy(() =>
    getTensorWithTargets(program, targets)
  );

  try {
    return [...(tensorWithTargets.dataSync() as Float32Array)];
  } finally {
    tensorWithTargets.dispose();
  }
};

it("runs", () => {
  const onePlusOne = [n("block", c("+", l(1), l(1)))];

  expect(testMultiTensors(onePlusOne, [0])).toEqual([2]);
});

it("can create and use variables", () => {
  const withVariables = n(
    "block",
    n("assign", n("def", "Some Variable"), n("literal", "number", 1, null)),
    n("ref", "Some Variable")
  );

  expect(testMultiTensors([withVariables], ["Some Variable"])).toEqual([1]);
});

it("can target specific expressions", () => {
  const withVariables = n(
    "block",
    n("assign", n("def", "Some Variable"), n("literal", "number", 1, null)),
    c("+", l(1), l(2)),
    n("ref", "Some Variable")
  );

  expect(testMultiTensors([withVariables], [[0, 1]])).toEqual([3]);
  expect(testMultiTensors([withVariables], [[0, 2]])).toEqual([1]);
});

it("can return multiple results", () => {
  const multipleResults = n(
    "block",
    n("assign", n("def", "Variable"), l(1)),
    c("+", n("ref", "Variable"), l(2))
  );

  expect(testMultiTensors([multipleResults], ["Variable", 0])).toEqual([1, 3]);
});

describe("functions", () => {
  it("can create and use functions", () => {
    const usingFunctions = n(
      "block",
      funcDef(
        "Function Name",
        ["Arg 1", "Arg 2"],
        c("+", n("ref", "Arg 1"), n("ref", "Arg 2"))
      ),
      c(
        "Function Name",
        n("literal", "number", 1, null),
        n("literal", "number", 2, null)
      )
    );

    expect(testMultiTensors([usingFunctions], [0])).toEqual([3]);
  });
});
