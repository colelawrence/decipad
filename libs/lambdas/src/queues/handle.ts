import { captureException, trace } from '@decipad/backend-trace';
import { timeout } from '@decipad/utils';

type Handler = (payload: any) => Promise<void>;

type Event = {
  Records: Array<{
    body: string;
  }>;
};

const TIMEOUT_MS = 50_000;

const processAllRecords = async (
  event: Event,
  userHandler: Handler
): Promise<void> => {
  const results = await Promise.allSettled(
    event.Records.map(async (record) => {
      await userHandler(JSON.parse(record.body));
    })
  );
  for (const result of results) {
    if (result.status === 'rejected') {
      await captureException(result.reason);
    }
  }
};

export default function queueHandler(userHandler: Handler) {
  return trace(async (event: Event) => {
    await Promise.race([
      processAllRecords(event, userHandler),
      timeout(TIMEOUT_MS),
    ]);
    return { statusCode: 200 };
  });
}
