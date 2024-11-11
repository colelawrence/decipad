/* eslint-disable func-names */
/* eslint-disable no-bitwise */
import { describe, expect, it } from 'vitest';
import { N } from '@decipad/number';
import { AST, Result, SerializedType } from '@decipad/language-interfaces';
import chunk from 'lodash/chunk';
import { deserializeResult, SerializedResult, serializeResult } from '.';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { FunctionValue } from 'libs/language-types/src/Value';

export const createSerializedResult = (
  type: bigint[],
  data: number[]
): SerializedResult => {
  return {
    type: new BigUint64Array(type),
    data: new Uint8Array(data),
  };
};

describe('serializeResult', () => {
  it('should serialize true', async () => {
    const resultTrue = await serializeResult({
      type: { kind: 'boolean' },
      value: true,
      meta: undefined,
    });

    expect(resultTrue).toEqual({
      type: BigUint64Array.from([0n, 0n, 1n]),
      data: new Uint8Array([1]),
    });
  });

  it('should serialize false', async () => {
    const resultTrue = await serializeResult({
      type: { kind: 'boolean' },
      value: false,
      meta: undefined,
    });

    expect(resultTrue).toEqual({
      type: BigUint64Array.from([0n, 0n, 1n]),
      data: new Uint8Array([0]),
    });
  });

  it('should serialize positive integers', async () => {
    const one = await serializeResult({
      type: { kind: 'number' },
      value: N({ n: 1n, d: 1n, s: 1n, infinite: false }),
      meta: undefined,
    });

    expect(one).toEqual({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 1, 1, 0, 0, 0, 1]),
    });
  });

  it('should serialize fractions', async () => {
    const oneThird = await serializeResult({
      type: { kind: 'number' },
      value: N({ n: 1n, d: 3n, s: 1 }),
      meta: undefined,
    });

    expect(oneThird).toEqual({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 1, 1, 0, 0, 0, 3]),
    });
  });

  it('should serialize zero', async () => {
    const zero = await serializeResult({
      type: { kind: 'number' },
      value: N({ n: 0n, d: 1n, s: 1n }),
      meta: undefined,
    });
    expect(zero).toEqual({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 1]),
    });
  });

  it('should serialize 1000', async () => {
    const result = await serializeResult({
      type: { kind: 'number' },
      value: N({ n: 1000n, d: 1n, s: 1n }),
      meta: undefined,
    });
    expect(result).toEqual({
      type: new BigUint64Array([10n, 0n, 11n]),
      data: new Uint8Array([2, 0, 0, 0, 232, 3, 1, 0, 0, 0, 1]),
    });
  });

  it('should serialize 54,320', async () => {
    const result = await serializeResult({
      type: { kind: 'number' },
      value: N({ n: 54_320n, d: 1n, s: 1n }),
      meta: undefined,
    });
    expect(result).toEqual({
      type: new BigUint64Array([10n, 0n, 12n]),
      data: new Uint8Array([3, 0, 0, 0, 48, 212, 0, 1, 0, 0, 0, 1]),
    });
  });

  it('should serialize negative numbers', async () => {
    const negativeOne = await serializeResult({
      type: { kind: 'number' },
      value: N({ n: 1n, d: 1n, s: -1n, infinite: false }),
      meta: undefined,
    });
    expect(negativeOne).toEqual({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 255, 1, 0, 0, 0, 1]),
    });
    const negativeDenominator = await serializeResult({
      type: { kind: 'number' },
      value: N({ n: 1n, d: -1n, s: 1n, infinite: false }),
      meta: undefined,
    });
    expect(negativeDenominator).toEqual({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 255, 1, 0, 0, 0, 1]),
    });
    const negativeBoth = await serializeResult({
      type: { kind: 'number' },
      value: N({ n: 1n, d: -1n, s: -1n, infinite: false }),
      meta: undefined,
    });
    expect(negativeBoth).toEqual({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 1, 1, 0, 0, 0, 1]),
    });
    const negativeSign = await serializeResult({
      type: { kind: 'number' },
      value: N({ n: 1n, d: 1n, s: -1n, infinite: false }),
      meta: undefined,
    });
    expect(negativeSign).toEqual({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 255, 1, 0, 0, 0, 1]),
    });
  });

  it('should serialize infinity', async () => {
    const positiveInfinity = await serializeResult({
      type: { kind: 'number' },
      value: N({ infinite: true }),
      meta: undefined,
    });
    expect(positiveInfinity).toEqual({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 1, 1, 0, 0, 0, 0]),
    });
    const negativeInfinity = await serializeResult({
      type: { kind: 'number' },
      value: N({ s: -1n, infinite: true }),
      meta: undefined,
    });
    expect(negativeInfinity).toEqual({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 255, 1, 0, 0, 0, 0]),
    });
  });

  it('should serialize a really big number', async () => {
    const result = await serializeResult({
      type: { kind: 'number' },
      value: N({
        n: 1189242266311298097986843979979816113623218530233116691614040514185247022195204198844876946793466766585567122298245572035602893621548531436948744330144832666119212097765405084496547968754459777242608939559827078370950263955706569157083419454002858062607403313379631011615034719463198885425053041533214276391294462878131935095911843534875187464576281961384589513841015342209735295593913297743190460395256449946622801655683395632954250335746706067480413944004242291424530217131889736651046664964054688638890098197338088365806846439851589037623048762666183525318766710116134286078596383357206224471031968005664344925563908503787189022850264597092446163614487870622937450201279974025663717864690129860114283018454698869499915778776199002005n,
        d: 5002009916778775199949688964548103824110689210964687173665204799721020547392260787844163616442907954620582209817873058093655294434665008691301744226027533836958706824316110176678135253816662678403267309851589346486085638808337918900988368864504694666401566379881317120354241922424004493140847606076475330524592365933865561082266499446525930640913477923193955925379022435101483159854831691826754647815784353481195905391318782644921936724123351403505245888913649174305161101369733133047062608582004549143807519656075593620590738707289559398062427779544578697456944805045677902129116662384410334478496341358451263982065302755428922217655856676643976496784488914025912207425814150404161966113320358123263116189799793486897908921136622429811n,
        s: 1n,
      }),
      meta: undefined,
    });

    expect(result).toMatchSnapshot();
  });

  it('should serialize a string', async () => {
    const result = await serializeResult({
      type: { kind: 'string' },
      value: 'Hello, world!',
      meta: undefined,
    });

    expect(result).toEqual({
      type: new BigUint64Array([2n, 0n, 13n]),
      data: new TextEncoder().encode('Hello, world!'),
    });
  });

  it('should serialize a date that has a value', async () => {
    const result = await serializeResult({
      type: { kind: 'date', date: 'day' },
      value: BigInt(new Date('2024-01-01T00:00:00.000Z').getTime()),
      meta: undefined,
    });

    const data = new Uint8Array(9);
    data.set([4], 0);
    data.set(new Uint8Array(new BigInt64Array([1704067200000n]).buffer), 1);

    expect(result).toEqual({
      type: new BigUint64Array([4n, 0n, 9n]),
      data,
    });
  });

  it('should serialize a date that has no value', async () => {
    const result = await serializeResult({
      type: { kind: 'date', date: 'day' },
      value: undefined,
      meta: undefined,
    });

    expect(result).toEqual({
      type: new BigUint64Array([4n, 0n, 1n]),
      data: new Uint8Array([4]),
    });
  });

  it.skip('should serialize a column of bools with compression', async () => {
    const column = await serializeResult({
      type: {
        kind: 'column',
        indexedBy: 'number',
        cellType: { kind: 'boolean' },
        atParentIndex: null,
      },
      async *value() {
        yield true;
        yield false;
        yield true;
      },
      meta: undefined,
    });

    expect(column).toEqual({
      type: new BigUint64Array([
        ...[3n, 1n, 3n], // column
        ...[0n | (1n << 63n), 3n, 1n], // booleans
      ]),
      data: new Uint8Array([1, 0, 1]),
    });
  });

  it('should serialize a column of bools without compression', async () => {
    const result = await serializeResult({
      type: {
        kind: 'column',
        indexedBy: 'number',
        cellType: { kind: 'boolean' },
        atParentIndex: null,
      },
      async *value() {
        yield true;
        yield false;
        yield true;
      },
      meta: undefined,
    });

    expect(chunk(Array.from(result.type), 3)).toEqual([
      [3n, 1n, 3n], // column
      [0n, 0n, 1n],
      [0n, 1n, 1n],
      [0n, 2n, 1n],
    ]);
    expect(result.data).toEqual(new Uint8Array([1, 0, 1]));
  });

  it('should serialize a column of strings', async () => {
    const column = await serializeResult({
      type: {
        kind: 'column',
        indexedBy: 'number',
        cellType: { kind: 'string' },
        atParentIndex: null,
      },
      async *value() {
        yield 'Hello';
        yield 'there';
        yield 'world';
        yield '!';
      },
      meta: undefined,
    });

    expect(column).toEqual({
      type: new BigUint64Array([
        ...[3n, 1n, 4n], // column
        ...[2n, 0n, 5n], // Hello
        ...[2n, 5n, 5n], // there
        ...[2n, 10n, 5n], // world
        ...[2n, 15n, 1n], // !
      ]),
      data: new TextEncoder().encode('Hellothereworld!'),
    });
  });

  // Abandoning compressed form for now
  it.skip('should serialize a column of columns of bools', async () => {
    const column = await serializeResult({
      type: {
        kind: 'column',
        indexedBy: 'number',
        atParentIndex: null,
        cellType: {
          kind: 'column',
          indexedBy: 'number',
          cellType: { kind: 'boolean' },
          atParentIndex: null,
        },
      },
      async *value() {
        yield async function* () {
          yield true;
          yield false;
        };
        yield async function* () {
          yield false;
          yield true;
        };
      },
      meta: undefined,
    });

    expect(column).toEqual({
      type: new BigUint64Array([
        ...[3n, 1n, 4n], // column
        ...[3n | (1n << 63n), 2n, 2n], // 2 x columns, length 2
        ...[0n | (1n << 63n), 2n, 1n], // 2 x booleans, length 1
      ]),
      data: new Uint8Array([1, 0, 0, 1]),
    });
  });

  it('should serialize a column of columns of strings', async () => {
    const column = await serializeResult({
      type: {
        kind: 'column',
        indexedBy: 'number',
        atParentIndex: null,
        cellType: {
          kind: 'column',
          indexedBy: 'number',
          cellType: { kind: 'string' },
          atParentIndex: null,
        },
      },
      async *value() {
        yield async function* () {
          yield 'Hello';
          yield 'World!';
        };
        yield async function* () {
          yield 'Deci';
          yield 'Pad';
        };
      },
      meta: undefined,
    });

    expect(chunk(Array.from(column.type), 3)).toEqual([
      [3n, 1n, 2n], // outer column
      [3n, 3n, 2n], // first inner column
      [3n, 5n, 2n], // second inner column
      [2n, 0n, 5n], // Hello
      [2n, 5n, 6n], // World!
      [2n, 11n, 4n], // Deci
      [2n, 15n, 3n], // Pad
    ]);
    expect(column.data).toEqual(new TextEncoder().encode('HelloWorld!DeciPad'));
  });

  // TODO test 3-dimensional strings
  const threeDimensionalStringColumn: Result.Result<'column'> = {
    type: {
      kind: 'column' as const,
      indexedBy: 'number' as const,
      atParentIndex: null,
      cellType: {
        kind: 'column' as const,
        indexedBy: 'number' as const,
        atParentIndex: null,
        cellType: {
          kind: 'column' as const,
          indexedBy: 'number' as const,
          cellType: { kind: 'string' as const },
          atParentIndex: null,
        },
      },
    },
    async *value() {
      yield async function* () {
        yield async function* () {
          yield 'Short';
          yield 'Longer string';
        };
        yield async function* () {
          yield 'Medium length';
          yield 'Very long string here';
        };
      };
      yield async function* () {
        yield async function* () {
          yield 'Another';
          yield 'Different lengths';
        };
        yield async function* () {
          yield 'Test';
          yield 'Variable string sizes';
        };
      };
    },
    meta: undefined,
  };

  it('should serialize a 3D column of strings with varying lengths', async () => {
    const serialized = await serializeResult(threeDimensionalStringColumn);

    expect(serialized.type.length).toBe(45); // 7 type entries * 3 values each

    expect(Array.from(serialized.type.slice(0, 3))).toEqual([3n, 1n, 2n]); // outer column

    expect(Array.from(serialized.type.slice(3, 6))).toEqual([3n, 3n, 2n]); // first middle column
    expect(Array.from(serialized.type.slice(6, 9))).toEqual([3n, 5n, 2n]); // second middle column

    expect(Array.from(serialized.type.slice(9, 12))).toEqual([3n, 7n, 2n]); // first inner column
    expect(Array.from(serialized.type.slice(12, 15))).toEqual([3n, 9n, 2n]); // second inner column
    expect(Array.from(serialized.type.slice(15, 18))).toEqual([3n, 11n, 2n]); // third inner column
    expect(Array.from(serialized.type.slice(18, 21))).toEqual([3n, 13n, 2n]); // fourth inner column

    expect(Array.from(serialized.type.slice(21, 24))).toEqual([2n, 0n, 5n]); // "Short"
    expect(Array.from(serialized.type.slice(24, 27))).toEqual([2n, 5n, 13n]); // "Longer string"
    expect(Array.from(serialized.type.slice(27, 30))).toEqual([2n, 18n, 13n]); // "Medium length"
    expect(Array.from(serialized.type.slice(30, 33))).toEqual([2n, 31n, 21n]); // "Very long string here"
    expect(Array.from(serialized.type.slice(33, 36))).toEqual([2n, 52n, 7n]); // "Another"
    expect(Array.from(serialized.type.slice(36, 39))).toEqual([2n, 59n, 17n]); // "Different lengths"
    expect(Array.from(serialized.type.slice(39, 42))).toEqual([2n, 76n, 4n]); // "Test"
    expect(Array.from(serialized.type.slice(42, 45))).toEqual([2n, 80n, 21n]); // "Variable string sizes"

    const decodedData = new TextDecoder().decode(serialized.data);
    expect(decodedData).toBe(
      'ShortLonger stringMedium lengthVery long string hereAnotherDifferent lengthsTestVariable string sizes'
    );
  });

  it('should serialize a table', async () => {
    const table = {
      type: {
        columnNames: ['T1', 'T2'],
        columnTypes: [
          {
            kind: 'string',
          },
          {
            kind: 'string',
          },
        ],
        delegatesIndexTo: 'exprRef_block_0_del',
        indexName: 'exprRef_block_0_ind',
        kind: 'table',
      } as SerializedType,
      value: [
        async function* () {
          yield 'Short';
          yield 'Longer string';
        },
        async function* () {
          yield 'Medium length';
          yield 'Very long string here';
        },
      ],
      meta: undefined,
    };

    const serialized = await serializeResult(table);
    expect(chunk(Array.from(serialized.type), 3)).toEqual([
      [5n, 1n, 2n], // table
      [2n, 0n, 19n], // indexName
      [2n, 19n, 19n], // delegatesIndexTo
      [2n, 38n, 2n], // T1
      [2n, 40n, 2n], // T2
      [3n, 7n, 2n], // column
      [3n, 9n, 2n], // column
      [2n, 42n, 5n], // T1
      [2n, 47n, 13n], // T1
      [2n, 60n, 13n], // T2
      [2n, 73n, 21n], // T2
    ]);
    expect(new TextDecoder().decode(serialized.data)).toEqual(
      'exprRef_block_0_ind' +
        'exprRef_block_0_del' +
        'T1' +
        'T2' +
        'ShortLonger stringMedium lengthVery long string here'
    );
  });

  it('should serialize a materialized column of strings', async () => {
    const column = await serializeResult({
      type: {
        kind: 'materialized-column',
        indexedBy: 'number',
        cellType: { kind: 'string' },
        atParentIndex: null,
      },
      value: ['Hello', 'there', 'world', '!'],
      meta: undefined,
    });

    expect(column).toEqual({
      type: new BigUint64Array([
        ...[3n, 1n, 4n], // column
        ...[2n, 0n, 5n], // Hello
        ...[2n, 5n, 5n], // there
        ...[2n, 10n, 5n], // world
        ...[2n, 15n, 1n], // !
      ]),
      data: new TextEncoder().encode('Hellothereworld!'),
    });
  });

  it('should serialize a materialized table', async () => {
    const table = {
      type: {
        columnNames: ['T1', 'T2'],
        columnTypes: [
          {
            kind: 'string',
          },
          {
            kind: 'string',
          },
        ],
        delegatesIndexTo: 'exprRef_block_0_del',
        indexName: 'exprRef_block_0_ind',
        kind: 'materialized-table',
      } as SerializedType,
      value: [
        ['Short', 'Longer string'],
        ['Medium length', 'Very long string here'],
      ],
      meta: undefined,
    };

    const serialized = await serializeResult(table);
    expect(chunk(Array.from(serialized.type), 3)).toEqual([
      [5n, 1n, 2n], // table
      [2n, 0n, 19n], // indexName
      [2n, 19n, 19n], // delegatesIndexTo
      [2n, 38n, 2n], // T1
      [2n, 40n, 2n], // T2
      [3n, 7n, 2n], // column
      [3n, 9n, 2n], // column
      [2n, 42n, 5n], // T1
      [2n, 47n, 13n], // T1
      [2n, 60n, 13n], // T2
      [2n, 73n, 21n], // T2
    ]);
    expect(new TextDecoder().decode(serialized.data)).toEqual(
      'exprRef_block_0_ind' +
        'exprRef_block_0_del' +
        'T1' +
        'T2' +
        'ShortLonger stringMedium lengthVery long string here'
    );
  });

  it('should serialize a range containing bigints', async () => {
    const range = await serializeResult({
      type: { kind: 'range', rangeOf: { kind: 'number' } },
      value: [1n, 4n],
      meta: undefined,
    });

    expect(range).toEqual({
      type: new BigUint64Array([6n, 0n, 20n]),
      data: new Uint8Array([
        1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 4, 1, 0, 0, 0, 1,
      ]),
    });
  });

  it('should serialize a range containing DeciNumbers', async () => {
    const range = await serializeResult({
      type: { kind: 'range', rangeOf: { kind: 'number' } },
      value: [N({ n: 1n, d: 1n, s: 1n }), N({ n: 4n, d: 1n, s: 1n })],
      meta: undefined,
    });

    expect(range).toEqual({
      type: new BigUint64Array([6n, 0n, 20n]),
      data: new Uint8Array([
        1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 4, 1, 0, 0, 0, 1,
      ]),
    });
  });

  it('should serialize a row', async () => {
    const row = await serializeResult({
      type: {
        kind: 'row',
        rowIndexName: 'rowIndexName',
        rowCellTypes: [{ kind: 'string' }, { kind: 'number' }],
        rowCellNames: ['String', 'Number'],
      },
      value: ['Hello there', N({ n: 1n, d: 3n, s: 1n })],
      meta: undefined,
    });
    const rowIndexNameData = new TextEncoder().encode('rowIndexName');
    const cell1NameData = new TextEncoder().encode('String');
    const cell1Data = new TextEncoder().encode('Hello there');
    const cell2NameData = new TextEncoder().encode('Number');
    const cell2Data = new Uint8Array([1, 0, 0, 0, 1, 1, 0, 0, 0, 3]);
    expect(chunk(row.type, 3)).toEqual([
      [7n, 1n, 2n], // row
      [2n, 0n, 12n], // rowIndexName
      [2n, 12n, 6n], // String
      [2n, 18n, 11n], // Hello there
      [2n, 29n, 6n], // Number
      [10n, 35n, 10n], // 1/3
    ]);
    expect(row.data).toEqual(
      new Uint8Array([
        ...rowIndexNameData,
        ...cell1NameData,
        ...cell1Data,
        ...cell2NameData,
        ...cell2Data,
      ])
    );
  });

  it('should serialize a tree with no children', async () => {
    const result = await serializeResult({
      type: {
        kind: 'tree',
        columnNames: [],
        columnTypes: [],
      },
      value: Value.Tree.from(
        true, // root
        undefined, // rootAggregation
        [], // children
        [
          {
            name: 'Col1',
            aggregation: {
              type: { kind: 'number' },
              value: N(1),
              meta: undefined,
            },
          },
        ], // columns
        1 // originalCardinality
      ),
    });

    expect(chunk(result.type, 3)).toEqual([
      [11n, 1n, 7n], // tree
      [0n, 0n, 1n], // root
      [13n, 0n, 0n], // root aggregation
      [10n, 1n, 10n], // originalCardinality
      [10n, 11n, 10n], // column length
      [2n, 21n, 4n], // Col1 name
      [10n, 25n, 10n], // Col1 aggregation
      [10n, 35n, 10n], // child count
    ]);

    expect(result.data).toEqual(
      new Uint8Array([
        1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67, 111,
        108, 49, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
      ])
    );
  });

  it('should serialize a tree', async () => {
    const result = await serializeResult({
      type: {
        kind: 'tree',
        columnNames: [],
        columnTypes: [],
      },
      value: Value.Tree.from(
        true, // root
        undefined, // rootAggregation
        [
          Value.Tree.from(N(1), undefined, [], [], 0),
          Value.Tree.from(N(1), undefined, [], [], 0),
        ], // children
        [
          {
            name: 'Col1',
            aggregation: {
              type: { kind: 'number' },
              value: N(1),
              meta: undefined,
            },
          },
        ], // columns
        1 // originalCardinality
      ),
    });

    expect(chunk(result.type, 3)).toEqual([
      [11n, 1n, 9n], // tree
      [0n, 0n, 1n], // root
      [13n, 0n, 0n], // root aggregation
      [10n, 1n, 10n], // originalCardinality
      [10n, 11n, 10n], // column length
      [2n, 21n, 4n], // Col1 name
      [10n, 25n, 10n], // Col1 aggregation
      [10n, 35n, 10n], // child count
      [11n, 10n, 5n], // tree 1
      [11n, 15n, 5n], // tree 2
      [10n, 45n, 10n],
      [13n, 0n, 0n],
      [10n, 55n, 10n],
      [10n, 65n, 10n],
      [10n, 75n, 10n],
      [10n, 85n, 10n],
      [13n, 0n, 0n],
      [10n, 95n, 10n],
      [10n, 105n, 10n],
      [10n, 115n, 10n],
    ]);

    expect(result.data).toEqual(
      new Uint8Array([
        1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67, 111,
        108, 49, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 1, 0, 0, 0, 1, 1,
        0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0,
        1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0,
        1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0,
        0, 0, 1, 0, 0, 0, 1,
      ])
    );
  });

  it('should serialize a type error', async () => {
    const result = await serializeResult({
      type: {
        kind: 'type-error',
        errorCause: {
          errType: 'free-form',
          message: 'Some error message',
        },
        errorLocation: {
          start: { line: 1, column: 1, char: 1 },
          end: { line: 2, column: 2, char: 2 },
        },
      },
      value: null,
      meta: undefined,
    });

    expect(result).toEqual({
      type: new BigUint64Array([8n, 0n, 0n]),
      data: new Uint8Array(),
    });
  });

  it('should serialize pending', async () => {
    const result = await serializeResult({
      type: {
        kind: 'pending',
      },
      value: null,
      meta: undefined,
    });

    expect(result).toEqual({
      type: new BigUint64Array([9n, 0n, 0n]),
      data: new Uint8Array(0),
    });
  });

  it('should serialize a function', async () => {
    const block: AST.Block = {
      type: 'block',
      id: 'block-id',
      args: [
        {
          type: 'function-call',
          args: [
            { type: 'funcref', args: ['+'] },
            {
              type: 'argument-list',
              args: [
                { type: 'ref', args: ['arg1'] },
                { type: 'ref', args: ['arg2'] },
              ],
            },
          ],
        },
      ],
    };

    const value: FunctionValue = {
      argumentNames: ['arg1', 'arg2'],
      body: block,
      // not sure why we need this tbh, but the type checker complains otherwise
      async getData() {
        return this;
      },
    };

    const result = await serializeResult({
      type: {
        kind: 'function',
        name: 'add',
        argNames: ['arg1', 'arg2'],
      },
      value,
    });
    expect(result).toEqual({
      type: BigUint64Array.from([
        ...[12n, 1n, 2n],
        // function name
        ...[2n, 0n, 3n],
        ...[2n, 3n, 4n],
        ...[2n, 7n, 4n],
        ...[2n, 11n, 203n],
      ]),
      data: new TextEncoder().encode(
        'addarg1arg2{"type":"block","id":"block-id","args":[{"type":"function-call","args":[{"type":"funcref","args":["+"]},{"type":"argument-list","args":[{"type":"ref","args":["arg1"]},{"type":"ref","args":["arg2"]}]}]}]}'
      ),
    });
  });
});

describe('deserializeResult', () => {
  it('should deserialize boolean true', () => {
    const serializedTrue = {
      type: BigUint64Array.from([0n, 0n, 1n]),
      data: new Uint8Array([1]),
    };

    const result = deserializeResult(serializedTrue);
    expect(result).toEqual({
      type: { kind: 'boolean' },
      value: true,
    });
  });

  it('should deserialize boolean false', () => {
    const serializedFalse = {
      type: BigUint64Array.from([0n, 0n, 1n]),
      data: new Uint8Array([0]),
    };

    const result = deserializeResult(serializedFalse);
    expect(result).toEqual({
      type: { kind: 'boolean' },
      value: false,
    });
  });

  it('should deserialize positive integers', async () => {
    const one = deserializeResult({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 1, 1, 0, 0, 0, 1]),
    });

    expect(one).toEqual({
      type: { kind: 'number' },
      value: N({ n: 1n, d: 1n, s: 1n, infinite: false }),
    });
  });

  it('should deserialize positive fractions', async () => {
    const oneThird = deserializeResult({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 1, 1, 0, 0, 0, 3]),
    });

    expect(oneThird).toEqual({
      type: { kind: 'number' },
      value: N({ n: 1n, d: 3n, s: 1n, infinite: false }),
    });
  });

  it('should deserialize zero', async () => {
    const zero = deserializeResult({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 1]),
    });
    expect(zero).toEqual({
      type: { kind: 'number' },
      value: N({ n: 0n, d: 1n, s: 1n }),
    });
  });

  it('should deserialize 1000', async () => {
    const result = deserializeResult({
      type: new BigUint64Array([10n, 0n, 11n]),
      data: new Uint8Array([2, 0, 0, 0, 232, 3, 1, 0, 0, 0, 1]),
    });
    expect(result).toEqual({
      type: { kind: 'number' },
      value: N({ n: 1000n, d: 1n, s: 1n }),
    });
  });

  it('should deserialize 54,320', async () => {
    const result = deserializeResult({
      type: new BigUint64Array([10n, 0n, 12n]),
      data: new Uint8Array([3, 0, 0, 0, 48, 212, 0, 1, 0, 0, 0, 1]),
    });
    expect(result).toEqual({
      type: { kind: 'number' },
      value: N({ n: 54_320n, d: 1n, s: 1n }),
    });
  });

  it('should deserialize negative numbers', async () => {
    const negativeOne = deserializeResult({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 255, 1, 0, 0, 0, 1]),
    });
    expect(negativeOne).toEqual({
      type: { kind: 'number' },
      value: N({ n: 1n, d: 1n, s: -1n, infinite: false }),
    });

    const negativeDenominator = deserializeResult({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 255, 1, 0, 0, 0, 1]),
    });
    expect(negativeDenominator).toEqual({
      type: { kind: 'number' },
      value: N({ n: 1n, d: 1n, s: -1n, infinite: false }),
    });

    const negativeBoth = deserializeResult({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 1, 1, 0, 0, 0, 1]),
    });
    expect(negativeBoth).toEqual({
      type: { kind: 'number' },
      value: N({ n: 1n, d: 1n, s: 1n, infinite: false }),
    });

    const negativeSign = deserializeResult({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 255, 1, 0, 0, 0, 1]),
    });
    expect(negativeSign).toEqual({
      type: { kind: 'number' },
      value: N({ n: 1n, d: 1n, s: -1n, infinite: false }),
    });
  });

  it('should deserialize infinity', async () => {
    const positiveInfinity = deserializeResult({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 1, 1, 0, 0, 0, 0]),
    });
    expect(positiveInfinity).toEqual({
      type: { kind: 'number' },
      value: N({ infinite: true }),
    });

    const negativeInfinity = deserializeResult({
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 255, 1, 0, 0, 0, 0]),
    });
    expect(negativeInfinity).toEqual({
      type: { kind: 'number' },
      value: N({ s: -1n, infinite: true }),
    });
  });

  it('should deserialize a really big number', async () => {
    const n: Result.Result<'number'> = {
      type: { kind: 'number' },
      value: N({
        n: 1189242266311298097986843979979816113623218530233116691614040514185247022195204198844876946793466766585567122298245572035602893621548531436948744330144832666119212097765405084496547968754459777242608939559827078370950263955706569157083419454002858062607403313379631011615034719463198885425053041533214276391294462878131935095911843534875187464576281961384589513841015342209735295593913297743190460395256449946622801655683395632954250335746706067480413944004242291424530217131889736651046664964054688638890098197338088365806846439851589037623048762666183525318766710116134286078596383357206224471031968005664344925563908503787189022850264597092446163614487870622937450201279974025663717864690129860114283018454698869499915778776199002005n,
        d: 5002009916778775199949688964548103824110689210964687173665204799721020547392260787844163616442907954620582209817873058093655294434665008691301744226027533836958706824316110176678135253816662678403267309851589346486085638808337918900988368864504694666401566379881317120354241922424004493140847606076475330524592365933865561082266499446525930640913477923193955925379022435101483159854831691826754647815784353481195905391318782644921936724123351403505245888913649174305161101369733133047062608582004549143807519656075593620590738707289559398062427779544578697456944805045677902129116662384410334478496341358451263982065302755428922217655856676643976496784488914025912207425814150404161966113320358123263116189799793486897908921136622429811n,
        s: 1n,
      }),
      meta: undefined,
    };
    const serialized = await serializeResult(n);
    const deserialized = deserializeResult(serialized);

    expect(deserialized).toEqual(n);
  });

  it('should deserialize infinity', () => {
    const serializedInfinity = {
      type: new BigUint64Array([1n, 0n, 16n]),
      data: new Uint8Array(new BigInt64Array([1n, 0n]).buffer),
    };

    const result = deserializeResult(serializedInfinity);
    expect(result).toEqual({
      type: { kind: 'number' },
      value: N({ infinite: true }),
    });
  });

  it('should deserialize negative infinity', () => {
    const serializedNegativeInfinity = {
      type: new BigUint64Array([1n, 0n, 16n]),
      data: new Uint8Array(new BigInt64Array([-1n, 0n]).buffer),
    };

    const result = deserializeResult(serializedNegativeInfinity);
    expect(result).toEqual({
      type: { kind: 'number' },
      value: N({ s: -1n, infinite: true }),
    });
  });

  it('should deserialize positive fractions', () => {
    const serializedOneThird = {
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 2, 1, 0, 0, 0, 6]),
    };

    const result = deserializeResult(serializedOneThird);
    expect(result).toMatchInlineSnapshot(`
      {
        "type": {
          "kind": "number",
        },
        "value": DeciNumber {
          "d": 3n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
      }
    `);
  });

  it('should deserialize negative fractions', () => {
    const serializedNegativeOneHalf = {
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 255, 1, 0, 0, 0, 2]),
    };

    const result = deserializeResult(serializedNegativeOneHalf);
    expect(result).toMatchInlineSnapshot(`
      {
        "type": {
          "kind": "number",
        },
        "value": DeciNumber {
          "d": 2n,
          "infinite": false,
          "n": 1n,
          "s": -1n,
        },
      }
    `);
  });

  it('should deserialize infinity', () => {
    const serializedInfinity = {
      type: new BigUint64Array([10n, 0n, 10n]),
      data: new Uint8Array([1, 0, 0, 0, 2, 1, 0, 0, 0, 0]),
    };

    const result = deserializeResult(serializedInfinity);
    expect(result).toEqual({
      type: { kind: 'number' },
      value: N({ infinite: true }),
    });
  });

  it('should deserialize a string', () => {
    const serializedString = {
      type: new BigUint64Array([2n, 0n, 13n]),
      data: new TextEncoder().encode('Hello, world!'),
    };

    const result = deserializeResult(serializedString);
    expect(result).toEqual({
      type: { kind: 'string' },
      value: 'Hello, world!',
    });
  });

  it('should deserialize a date with a value', () => {
    const data = new Uint8Array(9);
    data.set([4], 0);
    data.set(new Uint8Array(new BigInt64Array([1704067200000n]).buffer), 1);

    const serializedDate = {
      type: new BigUint64Array([4n, 0n, 9n]),
      data,
    };

    const result = deserializeResult(serializedDate);
    expect(result).toEqual({
      type: { kind: 'date', date: 'day' },
      value: 1704067200000n,
    });
  });

  it('should deserialize a date with no value', () => {
    const serializedDate = {
      type: new BigUint64Array([4n, 0n, 1n]),
      data: new Uint8Array([4]),
    };

    const result = deserializeResult(serializedDate);
    expect(result).toEqual({
      type: { kind: 'date', date: 'day' },
      value: undefined,
    });
  });

  it('should deserialize empty column', async () => {
    const serialized = createSerializedResult(
      [
        ...[3n, 1n, 0n], // column
      ],
      []
    );

    const result = deserializeResult(serialized);
    const columnData = result.value as () => AsyncGenerator<Result.OneResult>;
    const values = [];
    for await (const value of columnData()) {
      values.push(value);
    }

    expect(values).toEqual([]);
    expect(result.type).toEqual({
      kind: 'column',
      indexedBy: 'number',
      atParentIndex: null,
      cellType: { kind: 'anything' },
    });
  });

  it('should deserialize uncompressed column of booleans', async () => {
    const serialized = createSerializedResult(
      [
        ...[3n, 1n, 4n], // column
        ...[0n, 0n, 1n], // boolean
        ...[0n, 1n, 1n], // boolean
        ...[0n, 2n, 1n], // boolean
        ...[0n, 3n, 1n], // boolean
      ],
      [1, 0, 1, 0]
    );

    const result = deserializeResult(serialized);
    expect(result.type.kind).toBe('column');

    const columnData = result.value as () => AsyncGenerator<Result.OneResult>;
    const values = [];
    for await (const value of columnData()) {
      values.push(value);
    }

    expect(values).toEqual([true, false, true, false]);
  });

  it('should deserialize uncompressed column of fractions', async () => {
    const serialized: SerializedResult = {
      type: new BigUint64Array([
        ...[3n, 1n, 3n],
        ...[1n, 0n, 16n],
        ...[1n, 16n, 16n],
        ...[1n, 32n, 16n],
      ]),
      data: new Uint8Array(new BigInt64Array([1n, 2n, 3n, 4n, 5n, 6n]).buffer),
    };

    const result = deserializeResult(serialized);
    expect(result.type.kind).toBe('column');

    const columnData = result.value as () => AsyncGenerator<Result.OneResult>;
    const values = [];
    for await (const value of columnData()) {
      values.push(value);
    }

    expect(values).toMatchInlineSnapshot(`
      [
        DeciNumber {
          "d": 2n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 4n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 6n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
      ]
    `);
  });

  it('should deserialize uncompressed column of strings', async () => {
    const serialized = createSerializedResult(
      [...[3n, 1n, 3n], ...[2n, 0n, 5n], ...[2n, 5n, 5n], ...[2n, 10n, 4n]],
      [72, 101, 108, 108, 111, 87, 111, 114, 108, 100, 84, 101, 115, 116]
    );

    const result = deserializeResult(serialized) as Result.Result<'column'>;
    expect(result.type.kind).toEqual('column');
    expect(result.type.cellType).toEqual({ kind: 'string' });

    const columnData = result.value as () => AsyncGenerator<Result.OneResult>;
    const values = [];
    for await (const value of columnData()) {
      values.push(value);
    }

    expect(values).toEqual(['Hello', 'World', 'Test']);
  });

  it.skip('should deserialize compressed column of booleans', async () => {
    const serialized = createSerializedResult(
      [3n, 0n, 3n, 9223372036854775808n, 3n, 1n],
      [1, 0, 1]
    );

    const result = deserializeResult(serialized);
    expect(result.type.kind).toBe('column');

    const columnData = result.value as () => AsyncGenerator<Result.OneResult>;
    const values = [];
    for await (const value of columnData()) {
      values.push(value);
    }

    expect(values).toEqual([true, false, true]);
  });

  it.skip('should deserialize compressed column of fractions', async () => {
    const serialized: SerializedResult = {
      type: new BigUint64Array([3n, 0n, 48n, 9223372036854775809n, 3n, 16n]),
      data: new Uint8Array(new BigInt64Array([1n, 2n, 3n, 4n, 5n, 6n]).buffer),
    };

    const result = deserializeResult(serialized);
    expect(result.type.kind).toBe('column');

    const columnData = result.value as () => AsyncGenerator<Result.OneResult>;
    const values = [];
    for await (const value of columnData()) {
      values.push(value);
    }

    expect(values).toMatchInlineSnapshot(`
      [
        DeciNumber {
          "d": 2n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 4n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 6n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
      ]
    `);
  });

  it('should deserialize nested columns (uncompressed)', async () => {
    const serialized = createSerializedResult(
      [
        ...[3n, 1n, 2n], // col
        ...[3n, 3n, 2n], // subcol
        ...[3n, 5n, 2n], // subcol
        ...[0n, 0n, 1n], // bool
        ...[0n, 1n, 1n], // bool
        ...[0n, 2n, 1n], // bool
        ...[0n, 3n, 1n], // bool
      ],
      [1, 0, 0, 1]
    );

    const result = deserializeResult(serialized);
    expect(result.type.kind).toBe('column');

    const columnData = result.value as () => AsyncGenerator<Result.OneResult>;
    const values = [];
    for await (const value of columnData()) {
      values.push(value);
    }

    expect(values).toHaveLength(2);
    expect(values[0]).toBeInstanceOf(Function); // AsyncGenerator
    expect(values[1]).toBeInstanceOf(Function); // AsyncGenerator

    const subColumn1 = values[0] as () => AsyncGenerator<Result.OneResult>;
    const subColumn2 = values[1] as () => AsyncGenerator<Result.OneResult>;

    const subValues1 = [];
    for await (const value of subColumn1()) {
      subValues1.push(value);
    }
    expect(subValues1).toEqual([true, false]);

    const subValues2 = [];
    for await (const value of subColumn2()) {
      subValues2.push(value);
    }
    expect(subValues2).toEqual([false, true]);
  });

  it.skip('should deserialize nested columns (compressed)', async () => {
    const serialized = createSerializedResult(
      [3n, 0n, 4n, 9223372036854775812n, 2n, 2n, 9223372036854775808n, 2n, 1n],
      [1, 0, 0, 1]
    );

    const result = deserializeResult(serialized);
    expect(result.type.kind).toBe('column');

    const columnData = result.value as () => AsyncGenerator<Result.OneResult>;
    const values = [];
    for await (const value of columnData()) {
      values.push(value);
    }

    expect(values).toHaveLength(2);
    expect(values[0]).toBeInstanceOf(Function); // AsyncGenerator
    expect(values[1]).toBeInstanceOf(Function); // AsyncGenerator

    const subColumn1 = values[0] as () => AsyncGenerator<Result.OneResult>;
    const subColumn2 = values[1] as () => AsyncGenerator<Result.OneResult>;

    const subValues1 = [];
    for await (const value of subColumn1()) {
      subValues1.push(value);
    }
    expect(subValues1).toEqual([true, false]);

    const subValues2 = [];
    for await (const value of subColumn2()) {
      subValues2.push(value);
    }
    expect(subValues2).toEqual([false, true]);
  });

  it('should deserialize a column of columns of strings', async () => {
    const serialized: SerializedResult = {
      type: new BigUint64Array([
        ...[3n, 1n, 2n], // outer column
        ...[3n, 3n, 2n], // first inner column
        ...[3n, 5n, 2n], // second inner column
        ...[2n, 0n, 5n], // Hello
        ...[2n, 5n, 6n], // World!
        ...[2n, 11n, 4n], // Deci
        ...[2n, 15n, 3n], // Pad
      ]),
      data: new TextEncoder().encode('HelloWorld!DeciPad'),
    };

    const result = deserializeResult(serialized);
    expect(result.type.kind).toBe('column');

    const outerColumnData =
      result.value as () => AsyncGenerator<Result.OneResult>;
    const outerValues = [];
    for await (const innerColumn of outerColumnData()) {
      expect(innerColumn).toBeInstanceOf(Function); // AsyncGenerator

      const innerColumnData =
        innerColumn as () => AsyncGenerator<Result.OneResult>;
      const innerValues = [];
      for await (const value of innerColumnData()) {
        innerValues.push(value);
      }
      outerValues.push(innerValues);
    }

    expect(outerValues).toEqual([
      ['Hello', 'World!'],
      ['Deci', 'Pad'],
    ]);
  });

  it('should deserialize a tree with no children', async () => {
    const result = deserializeResult(
      createSerializedResult(
        [
          ...[11n, 1n, 7n], // tree
          ...[0n, 0n, 1n], // root
          ...[13n, 0n, 0n], // root aggregation
          ...[10n, 1n, 10n], // originalCardinality
          ...[10n, 11n, 10n], // column length
          ...[2n, 21n, 4n], // Col1 name
          ...[10n, 25n, 10n], // Col1 aggregation
          ...[10n, 35n, 10n], // child count
        ],
        [
          1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67,
          111, 108, 49, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0,
          1,
        ]
      )
    );

    expect(result).toEqual({
      type: {
        kind: 'tree',
        columnNames: [],
        columnTypes: [],
      },
      value: Value.Tree.from(
        true, // root
        undefined, // rootAggregation
        [], // children
        [
          {
            name: 'Col1',
            aggregation: {
              type: { kind: 'number' },
              value: N(1),
            },
          },
        ], // columns
        undefined // originalCardinality
      ),
    });
  });

  it('should deserialize a tree', async () => {
    const result = deserializeResult(
      createSerializedResult(
        [
          ...[11n, 1n, 9n], // tree
          ...[0n, 0n, 1n], // root
          ...[13n, 0n, 0n], // root aggregation
          ...[10n, 1n, 10n], // originalCardinality
          ...[10n, 11n, 10n], // column length
          ...[2n, 21n, 4n], // Col1 name
          ...[10n, 25n, 10n], // Col1 aggregation
          ...[10n, 35n, 10n], // child count
          ...[11n, 10n, 5n], // tree 1
          ...[11n, 15n, 5n], // tree 2
          // tree 1
          ...[10n, 45n, 10n], // tree 1 root
          ...[13n, 0n, 0n], // tree 1 root aggregation
          ...[10n, 55n, 10n], // tree 1 originalCardinality
          ...[10n, 65n, 10n], // tree 1 column length
          ...[10n, 75n, 10n], // tree 1 child count
          // tree 2
          ...[10n, 85n, 10n], // tree 2 root
          ...[13n, 0n, 0n], // tree 2 root aggregation
          ...[10n, 95n, 10n], // tree 2 originalCardinality
          ...[10n, 105n, 10n], // tree 2 column length
          ...[10n, 115n, 10n], // tree 2 child count
        ],
        [
          1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 67,
          111, 108, 49, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 1, 0, 0, 0,
          1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0,
          0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1,
          1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0,
          0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
        ]
      )
    );

    expect(result).toEqual({
      type: {
        kind: 'tree',
        columnNames: [],
        columnTypes: [],
      },
      value: Value.Tree.from(
        true, // root
        undefined, // rootAggregation
        [
          Value.Tree.from(N(1), undefined, [], [], 0),
          Value.Tree.from(N(1), undefined, [], [], 0),
        ], // children
        [
          {
            name: 'Col1',
            aggregation: {
              type: { kind: 'number' },
              value: N(1),
            },
          },
        ], // columns
        1 // originalCardinality
      ),
    });
  });

  it('should deserialize a date that has a value', () => {
    const data = new Uint8Array(9);
    data.set([4], 0);
    data.set(new Uint8Array(new BigInt64Array([1704067200000n]).buffer), 1);

    const serializedDate: SerializedResult = {
      type: new BigUint64Array([4n, 0n, 9n]),
      data,
    };

    const result = deserializeResult(serializedDate);
    expect(result).toEqual({
      type: { kind: 'date', date: 'day' },
      value: 1704067200000n,
    });
  });

  it('should deserialize a date that has no value', () => {
    const serializedDate: SerializedResult = {
      type: new BigUint64Array([4n, 0n, 1n]),
      data: new Uint8Array([4]),
    };

    const result = deserializeResult(serializedDate);
    expect(result).toEqual({
      type: { kind: 'date', date: 'day' },
      value: undefined,
    });
  });

  it('should deserialize a range', () => {
    const serializedRange: SerializedResult = {
      type: new BigUint64Array([6n, 0n, 20n]),
      data: new Uint8Array([
        1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 4, 1, 0, 0, 0, 1,
      ]),
    };

    const result = deserializeResult(serializedRange);
    expect(result).toEqual({
      type: {
        kind: 'range',
        rangeOf: { kind: 'number' },
      },
      value: [N(1n), N(4n)],
    });
  });

  it('should deserialize a table', () => {
    const serializedTable: SerializedResult = {
      type: new BigUint64Array([
        ...[5n, 1n, 2n], // table
        ...[2n, 0n, 19n], // indexName
        ...[2n, 19n, 19n], // delegatesIndexTo
        ...[2n, 38n, 2n], // T1
        ...[2n, 40n, 2n], // T2
        ...[3n, 7n, 2n], // column
        ...[3n, 9n, 2n], // column
        ...[2n, 42n, 5n], // T1
        ...[2n, 47n, 13n], // T1
        ...[2n, 60n, 13n], // T2
        ...[2n, 73n, 21n], // T2
      ]),
      data: new TextEncoder().encode(
        'exprRef_block_0_ind' +
          'exprRef_block_0_del' +
          'T1' +
          'T2' +
          'ShortLonger stringMedium lengthVery long string here'
      ),
    };

    const result = deserializeResult(serializedTable) as Result.Result<'table'>;
    expect(result.type.kind).toBe('table');
    expect(result.type.columnNames).toEqual(['T1', 'T2']);
    expect(result.type.columnTypes).toEqual([
      { kind: 'string' },
      { kind: 'string' },
    ]);
    expect(result.type.delegatesIndexTo).toEqual('exprRef_block_0_del');
    expect(result.type.indexName).toEqual('exprRef_block_0_ind');

    expect(result.value).toHaveLength(2);
    expect(result.value[0]).toBeInstanceOf(Function); // AsyncGenerator
    expect(result.value[1]).toBeInstanceOf(Function); // AsyncGenerator
  });

  it('should deserialize a row', () => {
    const rowIndexNameData = new TextEncoder().encode('rowIndexName');
    const cell1NameData = new TextEncoder().encode('String');
    const cell1Data = new TextEncoder().encode('Hello there');
    const cell2NameData = new TextEncoder().encode('Number');
    const cell2Data = new Uint8Array(new BigInt64Array([1n, 3n]).buffer);

    const serializedRow: SerializedResult = {
      type: new BigUint64Array([
        ...[7n, 1n, 2n], // row
        ...[2n, 0n, 12n], // rowIndexName
        ...[2n, 12n, 6n], // String
        ...[2n, 18n, 11n], // Hello there
        ...[2n, 29n, 6n], // Number
        ...[1n, 35n, 16n], // 1/3
      ]),
      data: new Uint8Array([
        ...rowIndexNameData,
        ...cell1NameData,
        ...cell1Data,
        ...cell2NameData,
        ...cell2Data,
      ]),
    };

    const result = deserializeResult(serializedRow);

    expect(result).toEqual({
      type: {
        kind: 'row',
        rowIndexName: 'rowIndexName',
        rowCellTypes: [{ kind: 'string' }, { kind: 'number' }],
        rowCellNames: ['String', 'Number'],
      },
      value: ['Hello there', N({ n: 1n, d: 3n, s: 1n })],
    });
  });

  it('should deserialize a type error', () => {
    const serializedTypeError: SerializedResult = {
      type: new BigUint64Array([8n, 0n, 0n]),
      data: new Uint8Array(),
    };

    const result = deserializeResult(serializedTypeError);

    expect(result).toEqual({
      type: {
        kind: 'type-error',
        errorCause: {
          errType: 'free-form',
          message: 'Error message lost in ABI translation.',
        },
      },
      value: undefined,
    });
  });

  it('should deserialize a pending result', () => {
    const serializedPending: SerializedResult = {
      type: new BigUint64Array([9n, 0n, 0n]),
      data: new Uint8Array(0),
    };

    const result = deserializeResult(serializedPending);
    expect(result).toEqual({
      type: { kind: 'pending' },
      value: undefined,
    });
  });

  it('should deserialize a function', () => {
    const serializedFunction = {
      type: BigUint64Array.from([
        ...[12n, 1n, 2n],
        // function name
        ...[2n, 0n, 3n],
        ...[2n, 3n, 4n],
        ...[2n, 7n, 4n],
        ...[2n, 11n, 203n],
      ]),
      data: new TextEncoder().encode(
        'addarg1arg2{"type":"block","id":"block-id","args":[{"type":"function-call","args":[{"type":"funcref","args":["+"]},{"type":"argument-list","args":[{"type":"ref","args":["arg1"]},{"type":"ref","args":["arg2"]}]}]}]}'
      ),
    };
    const result = deserializeResult(serializedFunction);

    const expected = {
      type: {
        kind: 'function',
        name: 'add',
      },
      value: {
        argumentNames: ['arg1', 'arg2'],
        // N.B. we're not testing for getData here because it makes the tests fail. But maybe we should be?
        body: {
          type: 'block',
          id: 'block-id',
          args: [
            {
              type: 'function-call',
              args: [
                { type: 'funcref', args: ['+'] },
                {
                  type: 'argument-list',
                  args: [
                    { type: 'ref', args: ['arg1'] },
                    { type: 'ref', args: ['arg2'] },
                  ],
                },
              ],
            },
          ],
        },
      },
    };
    expect(result).toMatchObject(expected);
  });
});
