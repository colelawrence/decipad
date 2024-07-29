import type {
  ComputeDeltaRequest,
  ProgramBlock,
} from '@decipad/computer-interfaces';
// eslint-disable-next-line no-restricted-imports
import { getIdentifierString } from '@decipad/language-utils';

const enrichProgramBlock = (block: ProgramBlock): ProgramBlock => {
  if (block.type === 'identified-block') {
    if (block.definesVariable == null && block.definesTableColumn == null) {
      for (const stmt of block.block.args) {
        if (
          stmt.type === 'assign' ||
          stmt.type === 'matrix-assign' ||
          stmt.type === 'function-definition' ||
          stmt.type === 'table'
        ) {
          return {
            ...block,
            definesVariable: getIdentifierString(stmt.args[0]),
          };
        }
        if (stmt.type === 'table-column-assign') {
          return {
            ...block,
            definesTableColumn: [
              getIdentifierString(stmt.args[0]),
              getIdentifierString(stmt.args[1]),
            ],
          };
        }
      }
    }
  }
  return block;
};

const enrichProgramDelta = (
  programDelta: NonNullable<ComputeDeltaRequest['program']>
): ComputeDeltaRequest['program'] => {
  return {
    ...programDelta,
    upsert: programDelta.upsert?.map(enrichProgramBlock),
  };
};

const enrichExtraDelta = (
  extraDelta: NonNullable<ComputeDeltaRequest['extra']>
): ComputeDeltaRequest['extra'] => {
  return {
    ...extraDelta,
    upsert: extraDelta.upsert
      ? new Map(
          Array.from(extraDelta.upsert.entries()).map(([key, value]) => [
            key,
            value.map(enrichProgramBlock),
          ])
        )
      : undefined,
  };
};

export const enrichComputeDelta = (
  delta: ComputeDeltaRequest
): ComputeDeltaRequest => {
  return {
    ...delta,
    program: delta.program ? enrichProgramDelta(delta.program) : undefined,
    extra: delta.extra ? enrichExtraDelta(delta.extra) : undefined,
  };
};
