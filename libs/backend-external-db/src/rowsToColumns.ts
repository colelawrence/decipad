import { KnexRawResponse } from './types';

export const rowsToColumns = ({
  rows,
  fields,
}: KnexRawResponse): Record<string, Array<unknown>> => {
  const columns: Record<string, Array<unknown>> = {};

  for (const field of fields) {
    columns[field.name ?? ''] = [];
  }

  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (!columns[key]) {
        columns[key] = [];
      }
      columns[key].push(value);
    }
  }

  return columns;
};
