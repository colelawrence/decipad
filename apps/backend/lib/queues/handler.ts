import { wrapHandler } from '../monitor';

type Handler = (payload: any) => Promise<void>;

type Event = {
  Records: Array<{
    body: string;
  }>;
};

export default function queueHandler(handler: Handler) {
  return wrapHandler(
    async (event: Event) => {
      for (const record of event.Records) {
        const message = JSON.parse(record.body);
        await handler(message);
      }
      return { statusCode: 200 };
    },
    { rethrow: false }
  );
}
