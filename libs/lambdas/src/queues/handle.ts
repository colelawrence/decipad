import { trace } from '@decipad/backend-trace';

type Handler = (payload: any) => Promise<void>;

type Event = {
  Records: Array<{
    body: string;
  }>;
};

export default function queueHandler(userHandler: Handler) {
  return trace(async (event: Event) => {
    const results = await Promise.allSettled(
      event.Records.map((record) => userHandler(JSON.parse(record.body)))
    );
    for (const result of results) {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    }
    return { statusCode: 200 };
  });
}
