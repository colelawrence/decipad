import { NotebookResults } from '@decipad/computer-interfaces';
import { Result } from '..';
import { slice } from '@decipad/generator-utils';

type MutableNotebookResults = {
  -readonly [K in keyof NotebookResults]: {
    -readonly [T in keyof NotebookResults[K]]: NotebookResults[K][T];
  };
};

export const LONG_COLUMN_SHORTENED_LENGTH = 20;

export const shortenLongResults =
  (lengthLimit: number) =>
  async (results: NotebookResults): Promise<NotebookResults> => {
    const filteredResults: MutableNotebookResults = { blockResults: {} };

    for (const [id, result] of Object.entries(results.blockResults)) {
      if (
        result.type !== 'computer-result' ||
        (result.result.type.kind !== 'table' &&
          result.result.type.kind !== 'column')
      ) {
        filteredResults.blockResults[id] = result;
        continue;
      }

      if (result.result.type.kind === 'table') {
        const { type, value, ...rest } =
          result.result as Result.Result<'table'>;

        const shortenedTableResult: Result.Result<'table'> = {
          ...rest,
          type,
          value: value.map(
            (v) => (start, end) =>
              slice(
                v(),
                start ?? 0,
                end == null ? lengthLimit : Math.min(lengthLimit, end)
              )
          ),
        };

        filteredResults.blockResults[id] = {
          ...result,
          result: shortenedTableResult as Result.Result,
        };
      } else {
        const { type, value, ...rest } =
          result.result as Result.Result<'column'>;

        const shortenedColumnResult: Result.Result<'column'> = {
          ...rest,
          type,
          value: (start, end) =>
            slice(
              value(),
              start ?? 0,
              end == null ? lengthLimit : Math.min(lengthLimit, end)
            ),
        };

        filteredResults.blockResults[id] = {
          ...result,
          result: shortenedColumnResult as Result.Result,
        };
      }
    }

    return filteredResults;
  };
