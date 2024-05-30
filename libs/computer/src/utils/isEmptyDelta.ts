import type { ComputeDeltaRequest } from '@decipad/computer-interfaces';
import { anyMappingSize } from '@decipad/utils';

export function isEmptyDelta(req: ComputeDeltaRequest): boolean {
  if (
    req.program != null &&
    ((req.program.remove != null && req.program.remove.length > 0) ||
      (req.program.upsert != null && req.program.upsert.length > 0))
  ) {
    return false;
  }

  if (
    req.extra != null &&
    ((req.extra.remove != null && req.extra.remove.length > 0) ||
      (req.extra.upsert != null && req.extra.upsert.size > 0))
  ) {
    return false;
  }

  if (
    req.external != null &&
    ((req.external.remove != null && req.external.remove.length > 0) ||
      (req.external.upsert != null && anyMappingSize(req.external.upsert) > 0))
  ) {
    return false;
  }

  return true;
}
