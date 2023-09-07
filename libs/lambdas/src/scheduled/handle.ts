import { ScheduledEvent } from 'aws-lambda';
import { debug } from '../debug';

type ScheduledHandler = (event: ScheduledEvent) => Promise<void>;

export default (handler: ScheduledHandler) => {
  return async (event: ScheduledEvent) => {
    debug('event: ', JSON.stringify(event));
    await handler(event);
    return { statusCode: 200 };
  };
};
