import type { PadRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';

export async function putPad(
  padId: string,
  partialPad: Partial<PadRecord>
): Promise<void> {
  const data = await tables();

  const pad = await data.pads.get({ id: padId });
  if (pad == null) {
    throw new Error('No pad exists with this ID');
  }

  await data.pads.put({ ...pad, ...partialPad });
}
