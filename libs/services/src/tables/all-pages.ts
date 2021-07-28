import {
  ConcreteRecord,
  DataTable,
  DynamoDbQuery,
} from '@decipad/backendtypes';
export default async function* allPages<T extends ConcreteRecord, T2 = T>(
  table: DataTable<T>,
  query: DynamoDbQuery,
  map: (rec: T) => T2 | Promise<T2 | undefined> = identity
) {
  let cursor;
  do {
    query.ExclusiveStartKey = cursor;
    const result = await table.query(query);
    for (const item of result.Items) {
      yield map(item);
    }

    cursor = result.LastEvaluatedKey;
  } while (cursor);
}

function identity(o: any) {
  return o;
}
