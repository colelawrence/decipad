import { wrapHandler } from '@decipad/services/monitor';

type Handler = (payload: any) => Promise<void>;

type Event = {
  Records: Array<{
    body: string;
  }>;
};

export default function queueHandler(userHandler: Handler) {
  return wrapHandler(
    async (event: Event) => {
      const results = await Promise.allSettled(
        event.Records.map((record) => userHandler(JSON.parse(record.body)))
      );
      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason;
        }
      }
      return { statusCode: 200 };
    },
    { rethrow: false }
  );
}
