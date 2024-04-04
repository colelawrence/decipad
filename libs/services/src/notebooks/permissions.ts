import type { PadRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';

/**
 * Helper function
 *
 * @throws if padID is not found.
 */
async function getPad(padId: string): Promise<PadRecord> {
  const data = await tables();

  const pad = await data.pads.get({ id: padId });
  if (pad == null) {
    throw new Error(`no pad exists with this id: ${padId}`);
  }

  return pad;
}

export function internalCanDuplicatePad(pad: PadRecord): boolean {
  if (pad.userAllowsPublicHighlighting) {
    return true;
  }

  if (!pad.isPublic) {
    return false;
  }

  //
  // If `canPublicDuplicate` is not present.
  // We default to allowing the user to duplicate.
  // Hence the more complicated statements below.
  //

  if (pad.canPublicDuplicate == null) {
    return true;
  }

  return pad.canPublicDuplicate;
}

/**
 * Given the ID of a notebook, can the public duplicate the pad.
 *
 * @throws Error if padID does not match DB pad.
 */
export async function canPublicDuplicatePad(padId: string): Promise<boolean> {
  const pad = await getPad(padId);
  return internalCanDuplicatePad(pad);
}

/**
 * Sets the flag to allow public to duplicate pad.
 *
 * @throws Error if padID does not match DB pad.
 */
export async function setCanPublicDuplicatePad(
  padId: string,
  canPublicDuplicate: boolean
): Promise<void> {
  const pad = await getPad(padId);

  const data = await tables();
  await data.pads.put({ ...pad, canPublicDuplicate });
}
