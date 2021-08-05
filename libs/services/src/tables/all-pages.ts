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
    // sequential
    // eslint-disable-next-line no-await-in-loop
    const result = await table.query(query);
    for (const item of result.Items) {
      yield map(item);
    }

    cursor = result.LastEvaluatedKey;
  } while (cursor);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function identity(o: any) {
  return o;
}
