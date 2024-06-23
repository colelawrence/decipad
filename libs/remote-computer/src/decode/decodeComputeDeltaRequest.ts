/* eslint-disable no-param-reassign */
import { anyMappingToMap } from '@decipad/utils';
import { decodeResult, decoders } from '@decipad/remote-computer-codec';
import type { ComputeDeltaRequest } from '..';
import type { SerializedComputeDeltaRequest } from '../types/serializedTypes';
import { decodeProgramBlock } from './decodeProgramBlock';

export const decodeComputeDeltaRequest = async (
  delta: SerializedComputeDeltaRequest
): Promise<ComputeDeltaRequest> => {
  if (delta.external?.upsert) {
    const newUpserts = await Promise.all(
      Array.from(anyMappingToMap(delta.external.upsert).entries()).map(
        async ([key, value]) =>
          [
            key,
            (await decodeResult(new DataView(value), 0, decoders))[0],
          ] as const
      )
    );
    (delta as ComputeDeltaRequest).external!.upsert = new Map(newUpserts);
  }

  if (delta.program?.upsert) {
    delta.program.upsert = delta.program.upsert.map(decodeProgramBlock);
  }

  if (delta.extra?.upsert) {
    delta.extra.upsert = new Map(
      Array.from(delta.extra.upsert.entries()).map(([key, value]) => [
        key,
        value.map(decodeProgramBlock),
      ])
    );
  }
  return delta as ComputeDeltaRequest;
};
