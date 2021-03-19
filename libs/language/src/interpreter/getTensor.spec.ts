import * as tf from "@tensorflow/tfjs-core";
import { n, c, l, col } from "../utils";

import { getTensor } from "./getTensor";
import { Realm } from './Realm'
import { isTable } from './types'

const testGetTensor = (statement: AST.Statement): number[] | Record<string, number[]> => {
  const columns = tf.tidy(() => {
    const tensor = getTensor(new Realm(), statement)

    // tf.tidy walks returned objects (just the top level though)
    return isTable(tensor) ? tensor : { __notTable: tensor }
  })

  try {
    let columnsWithData: Record<string, number[]> = {}
    for (const [key, value] of Object.entries(columns)) {
      columnsWithData[key] = [...value.dataSync()]
    }
    if (Array.isArray(columnsWithData.__notTable)) {
      return columnsWithData.__notTable
    } else {
      return columnsWithData
    }
  } finally {
    for (const tensor of Object.values(columns)) {
      tensor.dispose()
    }
  }
}

it("runs", () => {
  const onePlusOne = c("+", l(1), l(1));

  expect(testGetTensor(onePlusOne)).toEqual([2]);
});

it('evaluates conditions', () => {
  const condition = n('conditional', l(true), l(1), l(0))

  expect(testGetTensor(condition)).toEqual([1])
})

it('can perform calculations between columns and single numbers', () => {
  expect(testGetTensor(
    c('*', col(1, 2, 3), l(2))
  )).toEqual([2, 4, 6])

  expect(testGetTensor(
    c('/', col(1, 2, 3), l(2))
  )).toEqual([.5, 1, 1.5])

  expect(testGetTensor(
    c('+', l(1), col(1, 2, 3))
  )).toEqual([2, 3, 4])
})
