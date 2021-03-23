import * as tf from '@tensorflow/tfjs-core'
import { n, c, l } from '../utils'

import { Realm } from './Realm'
import { usesRecursion, evaluateRecursiveColumn, getWithSize } from './column'

it('can find a previous symbol', () => {
  expect(usesRecursion(c('previous', l(1)))).toEqual(true)
  expect(usesRecursion(c('Previous', l(1)))).toEqual(false)

  expect(usesRecursion(c('+', l(1), c('previous', l(1))))).toEqual(true)
  expect(usesRecursion(c('+', l(1), l(1)))).toEqual(false)
})

const dataOf = ( d: any ) => [...d.dataSync()]

describe('evaluateRecursiveColumn', () => {
  it('can emulate a quadratic function', () => {
    const realm = new Realm()

    expect(dataOf(evaluateRecursiveColumn(realm, c('*', l(2), c('previous', l(1))), 4)))
      .toEqual([2, 4, 8, 16])

    // Should be cleaned
    expect(realm.previousValue).toEqual(null)
  })

  it('can be used in a column with inherent size', () => {
    const realm = new Realm()
    realm.stack.set('numbers', tf.tensor([1, 2, 3, 4]))

    expect(
      dataOf(
        evaluateRecursiveColumn(
          realm,
          c('*', n('ref', 'numbers'), c('previous', l(1))),
          4
        )
      )
    ).toEqual([1, 2, 6, 24])

    // Should be cleaned
    expect(realm.previousValue).toEqual(null)
  })
})

it('can turn a tensor into something of the desired size', () => {
  const oneNumber = tf.tensor(1)
  const column = tf.tensor([1, 2, 3])

  expect(dataOf(getWithSize(oneNumber, 3))).toEqual([1, 1, 1])
  expect(dataOf(getWithSize(column, 3))).toEqual([1, 2, 3])
  expect(() => dataOf(getWithSize(column, 10))).toThrow(/panic:/)
})
