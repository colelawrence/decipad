import {
  Unknown,
  type Result,
  type SerializedType,
  type SerializedTypes,
  type Value as ValueTypes,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { decodeString } from './decodeString';
import { decodeResult } from './decodeResult';
import type { RecursiveDecoder } from './types';

const undefinedResult: Result.Result = {
  type: { kind: 'nothing' },
  value: Unknown,
};

export const decodeTree: RecursiveDecoder = async (
  rootType,
  buffer,
  _offset,
  recursiveDecoders
) => {
  let offset = _offset;
  const recursiveTreeDecode = async (
    currentRootType: SerializedType,
    type: SerializedTypes.Tree
  ): Promise<ValueTypes.Tree> => {
    if (type.kind !== 'tree') {
      throw new TypeError('Tree: Expected tree type');
    }

    const columnCount = buffer.getUint32(offset);
    offset += 4;

    const columnNames: string[] = [];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      let columnName: string;
      [columnName, offset] = decodeString(buffer, offset);
      columnNames.push(columnName);
    }

    // root: OneResult
    let root: Result.OneResult;
    [root, offset] = await recursiveDecoders[currentRootType.kind](
      currentRootType,
      buffer,
      offset,
      recursiveDecoders
    );

    // rootAggregation: Result
    let rootAggregation: Result.Result;
    [rootAggregation, offset] = await decodeResult(
      buffer,
      offset,
      recursiveDecoders
    );

    const originalCardinality = buffer.getUint32(offset);
    offset += 4;

    const columnAggregationCount = buffer.getUint32(offset);
    offset += 4;
    const columnAggregations: Array<{
      name: string;
      aggregation: Result.Result;
    }> = [];
    for (
      let columnIndex = 0;
      columnIndex < columnAggregationCount;
      columnIndex += 1
    ) {
      let columnName: string;
      [columnName, offset] = decodeString(buffer, offset);

      let columnAggregation: Result.Result;
      // eslint-disable-next-line no-await-in-loop
      [columnAggregation, offset] = await decodeResult(
        buffer,
        offset,
        recursiveDecoders
      );
      columnAggregations.push({
        name: columnName,
        aggregation: columnAggregation,
      });
    }

    const childCount = buffer.getUint32(offset);
    offset += 4;
    const childRootType = type.columnTypes[0];
    const children: ValueTypes.Tree[] = [];
    for (let childIndex = 0; childIndex < childCount; childIndex += 1) {
      const childTreeType: SerializedType = {
        kind: 'tree',
        columnNames: type.columnNames.slice(1),
        columnTypes: type.columnTypes.slice(1),
      };
      // eslint-disable-next-line no-await-in-loop
      const child = await recursiveTreeDecode(childRootType, childTreeType);
      children.push(child);
    }

    return Value.Tree.from(
      root,
      rootAggregation,
      children,
      columnAggregations,
      originalCardinality
    );
  };

  if (rootType.kind !== 'tree') {
    throw new TypeError('Tree: Expected tree type');
  }

  const tree = await recursiveTreeDecode(undefinedResult.type, rootType);
  return [tree, offset];
};
