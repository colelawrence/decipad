import { Type } from '../type'
import { reduceTypesThroughDims } from '../dimtools';

const num = Type.Number
const str = Type.String

describe('reduceTypesThroughDims', () => {
  it('shallow', () => {
    const calledOnTypes: Type[][] = []

    const result = reduceTypesThroughDims([num, str], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1
    })

    expect(result).toEqual(num)
    expect(calledOnTypes).toEqual([[num, str]])
  })

  it('columns can be mapped with single type mapFns', () => {
    const type = Type.buildColumn(str, 10)

    const calledOnTypes: Type[][] = []
    const result = reduceTypesThroughDims([type, type], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1
    })

    expect(result).toEqual(type)
    expect(calledOnTypes).toEqual([[str, str]])
  })

  it('can bump dimensions recursively', () => {
    const type = Type.buildColumn(Type.buildColumn(Type.buildColumn(str, 10), 11), 12)

    const calledOnTypes: Type[][] = []
    const result = reduceTypesThroughDims([type, str], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1
    })

    expect(result).toEqual(type)
    expect(calledOnTypes).toEqual([[str, str]])
  })

  it('compares columns and scalars on equal footing', () => {
    const type = Type.buildColumn(str, 10)

    const calledOnTypes: Type[][] = []
    const result = reduceTypesThroughDims([type, str], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1
    })

    expect(result).toEqual(type)
    expect(calledOnTypes).toEqual([[str, str]])
  })

  const typeId = (t: Type[]) => t[0]

  it('allows the same tuples', () => {
    const type = Type.buildTuple([str, num], ['Col1', 'Col2'])
    const otherType = Type.buildTuple([str, num], ['Col1', 'Col2'])

    expect(reduceTypesThroughDims([type, otherType], typeId))
      .toEqual(type)
  })

  it('errors with incompatible dims', () => {
    const errored1 = reduceTypesThroughDims([num, Type.buildTuple([num, str])], typeId)
    expect(errored1.errorCause).not.toBeNull()

    const erroredColLengths = reduceTypesThroughDims([
      Type.buildColumn(num, 1),
      Type.buildColumn(num, 2)
    ], typeId)
    expect(erroredColLengths.errorCause).not.toBeNull()

    const notErrored = reduceTypesThroughDims([
      Type.buildColumn(num, 2),
      Type.buildTuple([num, str])],
      typeId
    )
    expect(notErrored.errorCause).not.toBeNull()
  })

  it('errors with tuples with different cell names', () => {
    const t1 = Type.buildTuple([num], ['ColName1'])
    const tDiffNames = Type.buildTuple([num], ['ColNameDifferent'])
    const tNoNames = Type.buildTuple([num])

    expect(reduceTypesThroughDims([t1, tDiffNames], typeId))
      .toEqual(Type.Impossible.withErrorCause('Mismatched tuples'))

    expect(reduceTypesThroughDims([t1, tNoNames], typeId))
      .toEqual(Type.Impossible.withErrorCause('Mismatched tuples'))
  })
})
