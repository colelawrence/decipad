import { DataTable, TableRecordBase } from '@decipad/backendtypes';

/**
 * Increments the `value` field by `increment`.
 */
export async function incrementTableField<T extends TableRecordBase>(
  table: DataTable<T>,
  id: string,
  value: string,
  increment: number
): Promise<void> {
  await table.update({
    Key: {
      id,
    } as Partial<T>,
    UpdateExpression: `SET ${value} = ${value} + :${value}`,
    ExpressionAttributeValues: {
      [`:${value}`]: increment,
    },
  });
}
