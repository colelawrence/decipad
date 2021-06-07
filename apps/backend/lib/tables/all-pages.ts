export default async function* allPages<T>(
  table: DataTable<T>,
  query: DynamoDbQuery
) {
  let cursor;
  do {
    query.ExclusiveStartKey = cursor;
    const result = await table.query(query);
    for (const item of result.Items) {
      yield item;
    }

    cursor = result.LastEvaluatedKey;
  } while (cursor);
}
