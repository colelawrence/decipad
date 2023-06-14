import { captureException, trace } from '@decipad/backend-trace';
import { timeout } from '@decipad/utils';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

type RecordHandler<T> = (payload: T) => Promise<void>;

type EventWithRecord = APIGatewayProxyEventV2 & {
  Records?: Array<{
    body: string;
  }>;
};

const TIMEOUT_MS = 50_000;

const processAllRecords = async <T>(
  event: EventWithRecord,
  userHandler: RecordHandler<T>
): Promise<void> => {
  const results = await Promise.allSettled(
    (event as unknown as EventWithRecord).Records?.map(async (record) => {
      await userHandler(JSON.parse(record.body));
    }) ?? []
  );
  for (const result of results) {
    if (result.status === 'rejected') {
      await captureException(result.reason);
    }
  }
};

export default function queueHandler<T>(userHandler: RecordHandler<T>) {
  return trace(async (event: EventWithRecord) => {
    await Promise.race([
      processAllRecords(event, userHandler),
      timeout(TIMEOUT_MS),
    ]);
    return { statusCode: 200 };
  });
}
