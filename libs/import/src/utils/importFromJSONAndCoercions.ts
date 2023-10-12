import { Result } from '@decipad/remote-computer';
import { TableCellType } from '@decipad/editor-types';
import { columnTypeCoercionsToRec } from './columnTypeCoersionsToRec';
import { tableFlip } from './tableFlip';
import { importFromUnknownJson } from '../importFromUnknownJson';

export const importFromJSONAndCoercions = (
  msg: string,
  columnTypeCoercions: Array<TableCellType | undefined>
): Result.Result | undefined => {
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

    return importFromUnknownJson(parsedMsg, {
      columnTypeCoercions: columnTypeCoercionsToRec(columnTypeCoercions),
    });
  } catch (e) {
    return undefined;
  }
};
