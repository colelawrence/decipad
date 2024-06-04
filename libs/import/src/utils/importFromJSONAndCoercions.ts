import type { TableCellType } from '@decipad/editor-types';
import type { Computer } from '@decipad/computer-interfaces';
import type { Result } from '@decipad/language-interfaces';
import { columnTypeCoercionsToRec } from './columnTypeCoersionsToRec';
import { tableFlip } from './tableFlip';
import { importFromUnknownJson } from '../importFromUnknownJson';

export const importFromJSONAndCoercions = async (
  computer: Computer,
  msg: string,
  columnTypeCoercions: Array<TableCellType | undefined>
): Promise<Result.Result | undefined> => {
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

    return importFromUnknownJson(computer, parsedMsg, {
      columnTypeCoercions: columnTypeCoercionsToRec(columnTypeCoercions),
    });
  } catch (e) {
    return undefined;
  }
};
