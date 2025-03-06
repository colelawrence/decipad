import { Observable, Subscription } from 'rxjs';

export type Reporter<TEvent> = {
  onEvent: (event: TEvent) => void;
  onFlushTrigger: () => Array<EventWithTime<TEvent>>;

  peek: () => Array<EventWithTime<TEvent>>;
  onClose: () => void;
};

type EventWithTime<TEvent> = {
  time: string;
  event: TEvent;
};

type ReporterArgs<TEvent> = {
  subject?: Observable<TEvent>;
  maxEvents?: number;
  shouldTriggerFlush?: {
    condition: (event: TEvent) => boolean;
    flushCallback: (events: Array<EventWithTime<TEvent>>) => void;
  };
};

export const createReporter = <TEvent>({
  subject,
  maxEvents,
  shouldTriggerFlush,
}: ReporterArgs<TEvent> = {}): Reporter<TEvent> => {
  let queue: Array<EventWithTime<TEvent>> = [];
  let isClosed = false;

  const onFlushTrigger: Reporter<TEvent>['onFlushTrigger'] = () => {
    const items = queue;
    queue = [];

    return items;
  };

  const onEvent: Reporter<TEvent>['onEvent'] = (event) => {
    if (isClosed) {
      return;
    }

    queue.push({ event, time: new Date().toISOString() });

    if (maxEvents != null && queue.length > maxEvents) {
      queue.shift();
    }

    if (shouldTriggerFlush != null && shouldTriggerFlush.condition(event)) {
      const items = onFlushTrigger();
      shouldTriggerFlush.flushCallback(items);
    }
  };

  let subscription: Subscription | undefined;
  if (subject != null) {
    subscription = subject.subscribe(onEvent);
  }

  return {
    onEvent,
    onFlushTrigger,
    peek: () => queue,
    onClose() {
      isClosed = true;
      subscription?.unsubscribe();
    },
  };
};
