import type { Value } from '@decipad/language-interfaces';

export async function* values(
  self: Value.ColumnLikeValue,
  start = 0,
  end = Infinity
) {
  const rowCount = Math.min(await self.rowCount(), end);
  for (let index = start; index < rowCount; index++) {
    // eslint-disable-next-line no-await-in-loop
    yield (await self.atIndex(index)) as Value.Value;
  }
}
