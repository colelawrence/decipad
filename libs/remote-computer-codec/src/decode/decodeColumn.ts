import { scan } from '@decipad/generator-utils';
import { RecursiveDecoder } from './types';
import { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value, getResultGenerator } from '@decipad/language-types';

export const decodeColumn: RecursiveDecoder = async (
  type,
  buffer,
  _offset,
  decoders
) => {
  let offset = _offset;
  if (type.kind !== 'column' && type.kind !== 'materialized-column') {
    throw new TypeError('Column: Expected column or materialized-column type');
  }
  const { cellType } = type;
  const decoder = decoders[cellType.kind];
  const cellDecoder = async (
    innerBuffer: DataView,
    innerOffset: number
  ): Promise<[Result.OneResult, number]> => {
    const [value, newOffset] = await decoder(
      cellType,
      innerBuffer,
      innerOffset,
      decoders
    );
    offset = newOffset;
    return [value, newOffset];
  };

  const column = new Value.ReadSerializedColumn(
    type.cellType,
    cellDecoder,
    buffer,
    [],
    offset
  );

  const resultGen = getResultGenerator(await column.getData());

  await scan(resultGen());

  return [resultGen, offset];
};
