export default async function paginate<T1, T2 = T1>(
  table: DataTable<T1>,
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
