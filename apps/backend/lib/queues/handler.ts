import arc from '@architect/functions';

type Handler = (payload: any) => Promise<void>;

export default function queueHandler(handler: Handler) {
  return arc.queues.subscribe(async (payload: any) => {
    try {
      await handler(payload);
    } catch (err) {
      console.error('Error handling queue:', err);
      console.error('queue payload = ', JSON.stringify(payload, null, '\t'));
      throw err;
    }
  });
}
