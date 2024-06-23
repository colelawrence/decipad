import type { ComputeDeltaRequest } from '@decipad/computer-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import {
  encodeResult,
  recursiveEncoders as encoders,
} from '@decipad/remote-computer-codec';
import { anyMappingToMap } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
import type { SerializedComputeDeltaRequest } from '../types/serializedTypes';
import { encodeProgramBlock } from './encodeProgramBlock';

export const encodeComputeDeltaRequest = async (
  req: ComputeDeltaRequest
): Promise<SerializedComputeDeltaRequest> => {
  if (req.external) {
    if (req.external.upsert) {
      (req as SerializedComputeDeltaRequest).external!.upsert = new Map(
        await Promise.all(
          Array.from(anyMappingToMap(req.external.upsert).entries()).map(
            async ([key, value]) => {
              const buffer = new Value.GrowableDataView(
                createResizableArrayBuffer(1024)
              );
              const offset = await encodeResult(buffer, 0, value, encoders);
              return [key, buffer.seal(offset)] as const;
            }
          )
        )
      );
    }
  }
  if (req.program) {
    if (req.program.upsert) {
      req.program.upsert = req.program.upsert.map(encodeProgramBlock);
    }
  }

  if (req.extra) {
    if (req.extra.upsert) {
      req.extra.upsert = new Map(
        Array.from(req.extra.upsert.entries()).map(([key, value]) => [
          key,
          value.map(encodeProgramBlock),
        ])
      );
    }
  }

  return req as SerializedComputeDeltaRequest;
};
