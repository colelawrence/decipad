import {
  DataTable,
  DynamoDbQuery,
  PageInput,
  PagedResult,
  ConcreteRecord,
} from '@decipad/backendtypes';

export default async function paginate<T1 extends ConcreteRecord, T2>(
  table: DataTable<T1>,
  /* eslint-disable no-param-reassign */
  query: DynamoDbQuery,
  page: PageInput,
  map?: (rec: T1) => T2 | Promise<T2 | undefined>
): Promise<PagedResult<T2>> {
  const { cursor, maxItems } = page;

  query.Limit = maxItems;

  if (cursor) {
    query.ExclusiveStartKey = cursor;
  }

  const result = await table.query(query);
  const items = result.Items;
  let retItems: T2[];
  if (map) {
    const mappedItems = [];
    for (const item of items) {
      // TODO should we use Promise.all?
      // eslint-disable-next-line no-await-in-loop
      const retItem = await map(item);
      if (retItem) {
        mappedItems.push(retItem);
      }
    }
    retItems = mappedItems;
  } else {
    retItems = items as unknown as T2[];
  }

  return {
    items: retItems,
    count: items.length,
    hasNextPage: !!result.LastEvaluatedKey,
    cursor: result.LastEvaluatedKey,
  };
}
