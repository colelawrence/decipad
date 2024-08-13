import type DeciNumber from '@decipad/number';
import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import { Column } from './Column';
import { Scalar } from './Scalar';
import type { WriteSerializedColumnEncoder } from './WriteSerializedColumn';
import { WriteSerializedColumn } from './WriteSerializedColumn';
import { GrowableDataView } from './GrowableDataView';

describe('WriteSerializedColumn', () => {
  const emptyMeta = () => ({
    labels: undefined,
  });

  const encoder: WriteSerializedColumnEncoder<DeciNumber> = (
    buffer,
    _offset,
    value
  ) => {
    let offset = _offset;
    buffer.setBigInt64(offset, value.s! * value.n!);
    offset += 8;
    buffer.setBigInt64(offset, value.d!);
    offset += 8;
    return offset;
  };

  it('can be serialized', async () => {
    const source = Column.fromValues(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => N(n)).map(Scalar.fromValue),
      emptyMeta
    );
    const column = new WriteSerializedColumn(encoder, source);
    const buffer = new GrowableDataView(createResizableArrayBuffer(2));

    const offset = await column.serialize(buffer);
    expect(offset).toBe(164); // 4 + 10 * 16
    const result = new DataView(buffer.seal(offset));
    expect(result.byteLength).toBe(164);

    expect(result.getUint32(0)).toBe(10); // length (in number of elements)

    for (let i = 0; i < 10; i++) {
      const startOffset = i * 16 + 4;
      expect(result.getBigInt64(startOffset)).toBe(BigInt(i + 1)); // numerator
      expect(result.getBigInt64(startOffset + 8)).toBe(BigInt(1)); // denominator
    }
  });
});
