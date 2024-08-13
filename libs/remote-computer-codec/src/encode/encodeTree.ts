import {
  Unknown,
  type Result,
  type SerializedType,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  Value,
  buildType,
  deserializeType,
  serializeType,
} from '@decipad/language-types';
import { encodeString } from './encodeString';
import { encodeResult } from './encodeResult';
import type { RecursiveEncoder } from './types';

const undefinedResult: Result.Result = {
  type: { kind: 'nothing' },
  value: Unknown,
  meta: undefined,
};

export const encodeTree: RecursiveEncoder = async (
  rootResult,
  buffer,
  _offset,
  recursiveEncoders
) => {
  const { type: rootType, value: rootValue, meta: rootMeta } = rootResult;
  let offset = _offset;
  const recursiveTreeEncode = async (
    currentRootType: SerializedType,
    type: SerializedType,
    value: Result.OneResult
  ) => {
    if (type.kind !== 'tree') {
      throw new TypeError('Tree: Expected tree type');
    }
    if (!Value.isTreeValue(value)) {
      throw new TypeError('Tree: Expected tree value');
    }

    buffer.setUint32(offset, type.columnNames.length);
    offset += 4;

    for (const columnName of type.columnNames) {
      offset = encodeString(buffer, offset, columnName);
    }

    offset = await recursiveEncoders[currentRootType.kind](
      { type: currentRootType, value: value.root, meta: rootMeta },
      buffer,
      offset,
      recursiveEncoders
    );

    // rootAggregation: Result
    const { rootAggregation = undefinedResult } = value;
    offset = await encodeResult(
      buffer,
      offset,
      rootAggregation,
      recursiveEncoders
    );

    buffer.setUint32(offset, value.originalCardinality);
    offset += 4;

    buffer.setUint32(offset, value.columns.length);
    offset += 4;
    for (const column of value.columns) {
      offset = encodeString(buffer, offset, column.name);
      const aggregation = column.aggregation ?? undefinedResult;

      // eslint-disable-next-line no-await-in-loop
      offset = await encodeResult(
        buffer,
        offset,
        aggregation,
        recursiveEncoders
      );
    }

    buffer.setUint32(offset, value.children.length);
    offset += 4;
    const childRootType = type.columnTypes[0];
    for (const child of value.children) {
      const childTreeType = serializeType(
        buildType.tree({
          columnNames: type.columnNames.slice(1),
          columnTypes: type.columnTypes.slice(1).map(deserializeType),
        })
      );
      // eslint-disable-next-line no-await-in-loop
      await recursiveTreeEncode(childRootType, childTreeType, child);
    }
  };

  await recursiveTreeEncode(
    undefinedResult.type,
    rootType,
    rootValue ?? Unknown
  );
  return offset;
};
