import { Result } from '@decipad/computer';
import { importFromUnknownJson, tableFlip } from '@decipad/import';

export function MaybeResultFromWorker(msg: string): Result.Result | undefined {
  try {
    let parsedMsg: unknown = JSON.parse(msg);
    if (parsedMsg == null) {
      return undefined;
    }

    if (
      typeof parsedMsg === 'object' &&
      Array.isArray(parsedMsg) &&
      parsedMsg.length > 0 &&
      typeof parsedMsg[0] === 'object'
    ) {
      parsedMsg = tableFlip(parsedMsg);
    }

    return importFromUnknownJson(parsedMsg, {});
  } catch (e) {
    return undefined;
  }
}
