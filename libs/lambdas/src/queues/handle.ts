import { captureException, trace } from '@decipad/backend-trace';
import { timeout as runTimeout } from '@decipad/utils';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { debug } from '../debug';

type RecordHandler<T> = (payload: T) => Promise<void>;

type EventWithRecord = APIGatewayProxyEventV2 & {
  Records?: Array<{
    body: string;
  }>;
};

const DEFAULT_TIMEOUT_MS = 50_000;

const processAllRecords = async <T>(
  event: EventWithRecord,
  userHandler: RecordHandler<T>
): Promise<void> => {
  const results = await Promise.allSettled(
    (event as unknown as EventWithRecord).Records?.map(async (record) => {
      const payload = JSON.parse(record.body);
      debug('payload', payload);
      await userHandler(payload);
    }) ?? []
  );
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Error processing event', result.reason);
      await captureException(result.reason);
    }
  }
};

export interface QueueHandlerOptions {
  timeout?: number | false;
}

export default function queueHandler<T>(
  userHandler: RecordHandler<T>,
  { timeout = DEFAULT_TIMEOUT_MS }: QueueHandlerOptions = {}
) {
  return trace(async (event: EventWithRecord) => {
    if (typeof timeout === 'number') {
      await Promise.race([
        processAllRecords(event, userHandler),
        runTimeout(timeout),
      ]);
    } else {
      await processAllRecords(event, userHandler);
    }
    return { statusCode: 200 };
  });
}
