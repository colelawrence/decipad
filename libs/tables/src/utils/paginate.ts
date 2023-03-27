import {
  ConcreteRecord,
  DataTable,
  DynamoDbQuery,
  PagedResult,
  PageInput,
} from '@decipad/backendtypes';

interface PaginateOptions<T1, T2> {
  map?: (rec: T1) => T2 | Promise<T2 | undefined>;
  gqlType?: string;
}

export async function paginate<T1 extends ConcreteRecord, T2>(
  table: DataTable<T1>,
  /* eslint-disable no-param-reassign */
  query: DynamoDbQuery,
  page: PageInput,
  options: PaginateOptions<T1, T2> = {}
): Promise<PagedResult<T2>> {
  const { cursor, maxItems } = page;

  query.Limit = maxItems;

  if (cursor) {
    query.ExclusiveStartKey = cursor;
  }
  const result = await table.query(query);
  const items = result.Items;
  let retItems: T2[];
  if (options.map) {
    const mappedItems = [];
    for (const item of items) {
      // TODO should we use Promise.all?
      // eslint-disable-next-line no-await-in-loop
      const retItem = await options.map(item);
      if (retItem) {
        mappedItems.push(retItem);
      }
    }
    retItems = mappedItems;
  } else {
    retItems = items as unknown as T2[];
  }

  return {
    items: options.gqlType
      ? retItems.map((item) =>
          typeof item === 'object'
            ? { ...item, gqlType: options.gqlType }
            : item
        )
      : retItems,
    count: items.length,
    hasNextPage: !!result.LastEvaluatedKey,
    cursor: result.LastEvaluatedKey,
  };
}
