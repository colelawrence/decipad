import { dequal } from 'dequal'

import { getDefined } from '../utils'
import { Type } from '../type'

const tuplesMatch = (tupleA: Type, tupleB: Type) => {
  const typesA = getDefined(tupleA.tupleTypes)
  const typesB = getDefined(tupleB.tupleTypes)

  return dequal(tupleA.tupleNames, tupleB.tupleNames) && typesA.length === typesB.length
}


const allTuplesMatchDims = (tuples: Type[]) => {
  let lastTuple = tuples[0]
  const [, ...restTuples] = tuples

  for (const tuple of restTuples) {
    if (!tuplesMatch(lastTuple, tuple)) {
      return false
    } else {
      lastTuple = tuple
    }
  }

  return true
}

export const reduceTypesThroughDims = (types: Type[], mapFn: (types: Type[]) => Type): Type => {
  function recurse(types: Type[]): Type {
    const columns = types.filter(t => t.cellType != null)
    const tuples = types.filter(t => t.tupleTypes != null)

    if (tuples.length > 0) {
      if (tuples.length !== types.length || !allTuplesMatchDims(types)) {
        return Type.Impossible.withErrorCause('Mismatched tuples')
      } else {
        const tupleLength = getDefined(tuples[0].tupleTypes?.length)
        const tupleNames = tuples[0].tupleNames
        const tupleTypes = []

        for (let i = 0; i < tupleLength; i++) {
          const ithTupleTypes = tuples.map(t => getDefined(t.tupleTypes?.[i]))

          tupleTypes.push(recurse(ithTupleTypes))
        }

        return Type.buildTuple(tupleTypes, tupleNames)
      }
    }

    if (columns.length > 0) {
      const [first, ...rest] = columns
      const colSize = getDefined(first.columnSize)

      if (rest.every(col => col.columnSize === colSize)) {
        // Bring columns down to singles so we can call mapFn
        const asSingles = types.map(t => t.cellType ?? t)

        return Type.buildColumn(recurse(asSingles), colSize)
      } else {
        return Type.Impossible.withErrorCause('Mismatched column lengths')
      }
    }

    if (types.every(t => t.cardinality === 1)) {
      return mapFn(types)
    }

    throw new Error('unreachable')
  }

  return recurse(types)
}
