import * as Values from '../interpreter/Value';
import { Type } from '../type';
import { reduceTypesThroughDims, reduceValuesThroughDims } from '../dimtools';

const num = Type.Number;
const str = Type.String;

describe('reduceTypesThroughDims', () => {
  it('shallow', () => {
    const calledOnTypes: Type[][] = [];

    const result = reduceTypesThroughDims([num, str], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1;
    });

    expect(result).toEqual(num);
    expect(calledOnTypes).toEqual([[num, str]]);
  });

  it('columns can be mapped with single type mapFns', () => {
    const type = Type.buildColumn(str, 10);

    const calledOnTypes: Type[][] = [];
    const result = reduceTypesThroughDims([type, type], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1;
    });

    expect(result).toEqual(type);
    expect(calledOnTypes).toEqual([[str, str]]);
  });

  it('can bump dimensions recursively', () => {
    const type = Type.buildColumn(
      Type.buildColumn(Type.buildColumn(str, 10), 11),
      12
    );

    const calledOnTypes: Type[][] = [];
    const result = reduceTypesThroughDims([type, str], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1;
    });

    expect(result).toEqual(type);
    expect(calledOnTypes).toEqual([[str, str]]);
  });

  it('compares columns and scalars on equal footing', () => {
    const type = Type.buildColumn(str, 10);

    const calledOnTypes: Type[][] = [];
    const result = reduceTypesThroughDims([type, str], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1;
    });

    expect(result).toEqual(type);
    expect(calledOnTypes).toEqual([[str, str]]);
  });

  const typeId = (t: Type[]) => t[0];

  it('errors with incompatible dims', () => {
    const erroredColLengths = reduceTypesThroughDims(
      [Type.buildColumn(num, 1), Type.buildColumn(num, 2)],
      typeId
    );
    expect(erroredColLengths.errorCause).not.toBeNull();
  });

  it('errors with tuples', () => {
    const t1 = num;
    const tuple = Type.buildTuple([num]);

    expect(reduceTypesThroughDims([t1, tuple], typeId)).toEqual(
      Type.Impossible.withErrorCause('Unexpected tuple')
    );

    expect(reduceTypesThroughDims([tuple, tuple], typeId)).toEqual(
      Type.Impossible.withErrorCause('Unexpected tuple')
    );
  });

  it('can reduce types', () => {
    const total = ([a]: Type[]) => a.reduced();

    expect(
      reduceTypesThroughDims([Type.buildColumn(num, 5)], total, { reduces: 0 })
    ).toEqual(num);

    expect(
      reduceTypesThroughDims(
        [Type.buildColumn(Type.buildColumn(num, 5), 1)],
        total,
        { reduces: 0 }
      )
    ).toEqual(Type.buildColumn(num, 1));

    expect(() =>
      reduceTypesThroughDims([num], total, { reduces: 0 })
    ).toThrow();
    expect(() =>
      reduceTypesThroughDims(
        [Type.buildColumn(num, 5), Type.buildColumn(num, 5)],
        total,
        { reduces: 0 }
      )
    ).toThrow();
  });
});

describe('reduceValuesThroughDims', () => {
  it('can bump dimensions recursively', () => {
    const multiDim = Values.Column.fromValues([
      Values.Column.fromValues([
        Values.fromJS([2, 4]),
        Values.fromJS([8, 16]),
        Values.fromJS([32, 64]),
      ]),
    ]);

    const scalar = Values.fromJS(2);

    const calledOnValues: Values.Value[] = [];
    const result = reduceValuesThroughDims([multiDim, scalar], ([v1, v2]) => {
      calledOnValues.push(Values.Column.fromValues([v1, v2]));
      return Values.fromJS((v1.getData() as number) * (v2.getData() as number));
    });

    expect(result.getData()).toEqual([
      [
        [4, 8],
        [16, 32],
        [64, 128],
      ],
    ]);
    expect(calledOnValues.map((v) => v.getData())).toEqual([
      [2, 2],
      [4, 2],
      [8, 2],
      [16, 2],
      [32, 2],
      [64, 2],
    ]);
  });

  describe('value reduction', () => {
    const sumOne = ([val]: Values.SimpleValue[]) =>
      Values.fromJS((val.getData() as number[]).reduce((a, b) => a + b));

    it('does not reduce the last dimension, leaving the mapfn to it', () => {
      const values = Values.fromJS([1, 2, 4]);

      const result = reduceValuesThroughDims([values], sumOne, { reduces: 0 });

      expect(result.getData()).toEqual(7);
    });

    it('supports reducing the last of many dimensions', () => {
      const deepValues = Values.fromJS([
        [1, 2, 4],
        [8, 16, 32],
      ]);

      const result = reduceValuesThroughDims([deepValues], sumOne, {
        reduces: 0,
      });

      expect(result.getData()).toEqual([7, 56]);
    });

    it('panics with less than 1 dimension', () => {
      expect(() => {
        reduceValuesThroughDims([Values.fromJS(1)], sumOne, { reduces: 0 });
      }).toThrow(/Panic/i);
    });
  });
});
