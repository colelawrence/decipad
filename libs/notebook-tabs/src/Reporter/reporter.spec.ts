import { it, expect, vi } from 'vitest';
import { createReporter } from './reporter';
import { Subject } from 'rxjs';

const mockedTime = new Date(2025, 2, 28, 0, 0, 0, 0);
vi.setSystemTime(mockedTime);

it('keeps track of events in the correct time', () => {
  const reporter = createReporter<{ a: number }>();

  reporter.onEvent({ a: 1 });
  reporter.onEvent({ a: 2 });
  reporter.onEvent({ a: 3 });

  const events = reporter.onFlushTrigger();

  expect(events).toMatchInlineSnapshot(`
    [
      {
        "event": {
          "a": 1,
        },
        "time": "2025-03-28T00:00:00.000Z",
      },
      {
        "event": {
          "a": 2,
        },
        "time": "2025-03-28T00:00:00.000Z",
      },
      {
        "event": {
          "a": 3,
        },
        "time": "2025-03-28T00:00:00.000Z",
      },
    ]
  `);
});

it('can use RxJs as a stream', () => {
  const subject = new Subject<{ b: string }>();
  const reporter = createReporter({ subject });

  subject.next({ b: 'a' });
  subject.next({ b: 'aa' });
  subject.next({ b: 'aaa' });

  const events = reporter.onFlushTrigger();

  expect(events).toMatchInlineSnapshot(`
    [
      {
        "event": {
          "b": "a",
        },
        "time": "2025-03-28T00:00:00.000Z",
      },
      {
        "event": {
          "b": "aa",
        },
        "time": "2025-03-28T00:00:00.000Z",
      },
      {
        "event": {
          "b": "aaa",
        },
        "time": "2025-03-28T00:00:00.000Z",
      },
    ]
  `);
});

it('can keep a max amount of items', () => {
  const reporter = createReporter<{ a: number }>({ maxEvents: 2 });

  reporter.onEvent({ a: 1 });
  reporter.onEvent({ a: 2 });
  reporter.onEvent({ a: 3 });
  reporter.onEvent({ a: 4 });
  reporter.onEvent({ a: 5 });

  const events = reporter.onFlushTrigger();

  expect(events).toMatchInlineSnapshot(`
    [
      {
        "event": {
          "a": 4,
        },
        "time": "2025-03-28T00:00:00.000Z",
      },
      {
        "event": {
          "a": 5,
        },
        "time": "2025-03-28T00:00:00.000Z",
      },
    ]
  `);
});

it('triggers callback function when certain condition', () => {
  let flushedEvents;

  const reporter = createReporter<{ a: number }>({
    shouldTriggerFlush: {
      condition: (e) => e.a === 2,
      flushCallback: (events) => {
        flushedEvents = events;
      },
    },
  });

  reporter.onEvent({ a: 1 });
  reporter.onEvent({ a: 2 });

  const events = reporter.onFlushTrigger();

  expect(events).toHaveLength(0);
  expect(flushedEvents).toMatchInlineSnapshot(`
    [
      {
        "event": {
          "a": 1,
        },
        "time": "2025-03-28T00:00:00.000Z",
      },
      {
        "event": {
          "a": 2,
        },
        "time": "2025-03-28T00:00:00.000Z",
      },
    ]
  `);
});

it('doesnt save more events if its closed', () => {
  let flushedEvents;

  const reporter = createReporter<{ a: number }>({
    shouldTriggerFlush: {
      condition: (e) => e.a === 2,
      flushCallback: (events) => {
        flushedEvents = events;
      },
    },
  });

  reporter.onEvent({ a: 1 });
  reporter.onClose();

  // Here we hit the condition. But because we closed the reporter,
  // we no longer get events.
  reporter.onEvent({ a: 2 });

  expect(flushedEvents).toBeUndefined();
});
