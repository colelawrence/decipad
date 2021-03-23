import * as tf from '@tensorflow/tfjs-core'
import { walk, getIdentifierString, isExpression } from '../utils'
import { getTensor } from './getTensor'
import { Realm } from './Realm'
import { Table } from './types'

const isRecursiveReference = (expr: AST.Expression) =>
  expr.type === 'function-call' && getIdentifierString(expr.args[0]) === 'previous'

export const usesRecursion = (expr: AST.Expression) => {
  let result = false

  walk(expr, expr => {
    if (isExpression(expr) && isRecursiveReference(expr)) {
      result = true
    }
  })

  return result
}

const atIndex = (tensor: tf.Tensor, index: number) => {
  switch (tensor.shape.length) {
    case 0: {
      return tensor
    }
    case 1: {
      if (index <= tensor.shape[0]) {
        const slice = tf.slice(tensor, [index], [1])
        return tf.reshape(slice, [])
      }
      break
    }
  }
  throw new Error('index out of range: ' + index)
}

export const evaluateRecursiveColumn = (
  realm: Realm,
  column: AST.Expression,
  rowCount: number
) => {
  if (!usesRecursion(column)) {
    return getTensor(realm, column)
  } else {
    if (realm.previousValue != null) {
      throw new Error('panic: column must not contain another column')
    }

    const rows = []

    for (let i = 0; i < rowCount; i++) {
      const value = atIndex(getTensor(realm, column), i)
      realm.previousValue = value
      rows.push(tf.reshape(value, [1]))
    }

    realm.previousValue = null
    return tf.concat(rows)
  }
}

// Turn a tensor into a rowCount-sized 1D column
export const getWithSize = (col: tf.Tensor, rowCount: number) => {
  if (col.shape.length === 0) {
    return tf.tile(tf.reshape(col, [1]), [rowCount])
  } else if (col.shape[0] === rowCount) {
    return col
  } else {
    throw new Error('panic: bad column shape ' + JSON.stringify(col.shape) + ' incompatible with desired row count ' + rowCount)
  }
}

export const getLargestColumn = (table: Table): number => {
  const sizes: Set<number> = new Set(Object.values(table).map(t => t.shape.length === 0 ? 0 : t.shape[0]))

  return Math.max(...sizes)
}
