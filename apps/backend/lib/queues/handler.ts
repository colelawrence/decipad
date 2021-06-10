type Handler = (payload: any) => Promise<void>;

type Event = {
  Records: Array<{
    body: string;
  }>;
};

export default function queueHandler(handler: Handler) {
  return async (event: Event) => {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      try {
        await handler(message);
      } catch (err) {
        console.error('Error processing queue element: %j', message);
        console.error(err);
        // do not throw
      }
    }
    return {};
  };
}
