/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it, expect } from 'vitest';
import omit from 'lodash/omit';
import { noop } from '@decipad/utils';
import type { Result } from '@decipad/language-interfaces';
import { createMockWorkerPair } from './createMockWorkerPair';
import { createWorkerWorker } from '../worker/createWorkerWorker';
import { createWorkerClient } from '../client/createWorkerClient';
import { N } from '@decipad/number';
import { all, from, slice } from '@decipad/generator-utils';
// eslint-disable-next-line no-restricted-imports
import { getResultGenerator } from '@decipad/language-types';

interface RunTestParams {
  subscribe: (
    options: object,
    notifyFn: (notifyParams: object) => void
  ) => () => void;
  subscribeParams: object;
  notify: (
    err: Error | undefined,
    subscribeParams: unknown,
    params?: unknown
  ) => unknown;
}

describe('remote computer worker integration tests', () => {
  const ONE_MINUTE_MS = 60 * 1000;
  const runTest = async ({
    subscribe,
    subscribeParams,
    notify,
  }: RunTestParams) => {
    const [w1, w2, connect] = createMockWorkerPair();
    // worker
    createWorkerWorker({
      postMessage: w1.postMessage.bind(w1),
      readMessages: (cb) => {
        w1.addEventListener('message', cb as EventListener);
        return () => w1.removeEventListener('message', cb as EventListener);
      },
      subscribe,
      serviceId: 'service-id',
    });

    const client = createWorkerClient<unknown, unknown, unknown>(
      w2,
      'service-id'
    );
    connect();

    await client.subscribe(subscribeParams, notify);
  };

  // eslint-disable-next-line jest/no-focused-tests
  it(
    'can send and receive simple objects',
    () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>((resolve) => {
        runTest({
          subscribe: (options, notify) => {
            expect(omit(options, 'newSubscriptionId')).toEqual({ a: 1 });
            setTimeout(() => {
              notify({ b: 2 });
            }, 0);

            return noop;
          },
          subscribeParams: { a: 1 },
          notify: (err, subscribeParams, notificationParams) => {
            expect(err).toBeUndefined();
            expect(subscribeParams).toEqual({ a: 1 });
            expect(notificationParams).toEqual({ b: 2 });
            resolve();
          },
        });
      });
    },
    ONE_MINUTE_MS
  );

  it(
    'can send and receive numeric results',
    () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>((resolve) => {
        runTest({
          subscribe: (options, notify) => {
            expect(omit(options, 'newSubscriptionId')).toEqual({ a: 1 });
            setTimeout(() => {
              notify({ result: { type: { kind: 'number' }, value: N(10) } });
            }, 0);

            return noop;
          },
          subscribeParams: { a: 1 },
          notify: (err, subscribeParams, notificationParams) => {
            expect(err).toBeUndefined();
            expect(subscribeParams).toEqual({ a: 1 });
            expect(notificationParams).toMatchObject({
              result: { type: { kind: 'number' }, value: N(10) },
            });
            resolve();
          },
        });
      });
    },
    ONE_MINUTE_MS
  );

  it(
    'can send and receive materialized columnar results',
    () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>((resolve, reject) => {
        runTest({
          subscribe: (options, notify) => {
            expect(omit(options, 'newSubscriptionId')).toEqual({ a: 1 });
            const result: Result.Result = {
              type: {
                kind: 'materialized-column',
                cellType: { kind: 'number' },
                indexedBy: null,
              },
              value: [N(10), N(11), N(12)],
              meta: () => ({
                labels: Promise.resolve([['a', 'b', 'c']]),
              }),
            };
            setTimeout(() => {
              notify({ result });
            }, 0);

            return noop;
          },
          subscribeParams: { a: 1 },
          notify: async (err, subscribeParams, notificationParams) => {
            try {
              expect(err).toBeUndefined();
              expect(subscribeParams).toEqual({ a: 1 });
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const { result } = notificationParams;
              const { type, value } = result;
              expect(type).toEqual({
                kind: 'materialized-column',
                cellType: { kind: 'number' },
                indexedBy: null,
              });
              expect(typeof value).toEqual('function');
              const resultValue = await all(value());
              expect(resultValue).toMatchObject([N(10), N(11), N(12)]);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        });
      });
    },
    ONE_MINUTE_MS
  );

  it(
    'can send and receive partial materialized columnar results',
    () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>((resolve, reject) => {
        runTest({
          subscribe: (options, notify) => {
            expect(omit(options, 'newSubscriptionId')).toEqual({ a: 1 });
            const result: Result.Result = {
              type: {
                kind: 'materialized-column',
                cellType: { kind: 'number' },
                indexedBy: null,
              },
              value: [N(10), N(11), N(12), N(13), N(14)],
              meta: () => ({
                labels: Promise.resolve([['a', 'b', 'c', 'd', 'e']]),
              }),
            };
            setTimeout(() => {
              notify({ result });
            }, 0);

            return noop;
          },
          subscribeParams: { a: 1 },
          notify: async (err, subscribeParams, notificationParams) => {
            try {
              expect(err).toBeUndefined();
              expect(subscribeParams).toEqual({ a: 1 });
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const { result } = notificationParams;
              const { type, value } = result;
              expect(type).toEqual({
                kind: 'materialized-column',
                cellType: { kind: 'number' },
                indexedBy: null,
              });
              expect(typeof value).toEqual('function');
              const resultValue = await all(value(1, 3));
              expect(resultValue).toMatchObject([N(11), N(12)]);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        });
      });
    },
    ONE_MINUTE_MS
  );

  it(
    'can send and receive streaming columnar results',
    () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>((resolve, reject) => {
        runTest({
          subscribe: (options, notify) => {
            expect(omit(options, 'newSubscriptionId')).toEqual({ a: 1 });
            const result: Result.Result = {
              type: {
                kind: 'column',
                cellType: { kind: 'number' },
                indexedBy: null,
              },
              value: (start = 0, end = Infinity) =>
                slice(from([N(10), N(11), N(12)]), start, end),
              meta: () => ({
                labels: Promise.resolve([['a', 'b', 'c']]),
              }),
            };
            setTimeout(() => {
              notify({ result });
            }, 0);

            return noop;
          },
          subscribeParams: { a: 1 },
          notify: async (err, subscribeParams, notificationParams) => {
            try {
              expect(err).toBeUndefined();
              expect(subscribeParams).toEqual({ a: 1 });
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const { result } = notificationParams;
              const { type, value } = result;
              expect(type).toEqual({
                kind: 'column',
                cellType: { kind: 'number' },
                indexedBy: null,
              });
              expect(typeof value).toEqual('function');
              const resultValue = await all(value());
              expect(resultValue).toMatchObject([N(10), N(11), N(12)]);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        });
      });
    },
    ONE_MINUTE_MS
  );

  it(
    'can send and receive partial streaming columnar results',
    () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>((resolve, reject) => {
        runTest({
          subscribe: (options, notify) => {
            expect(omit(options, 'newSubscriptionId')).toEqual({ a: 1 });
            const result: Result.Result = {
              type: {
                kind: 'column',
                cellType: { kind: 'number' },
                indexedBy: null,
              },
              value: (start = 0, end = Infinity) =>
                slice(from([N(10), N(11), N(12), N(13), N(14)]), start, end),
              meta: () => ({
                labels: Promise.resolve([['a', 'b', 'c', 'd', 'e']]),
              }),
            };
            setTimeout(() => {
              notify({ result });
            }, 0);

            return noop;
          },
          subscribeParams: { a: 1 },
          notify: async (err, subscribeParams, notificationParams) => {
            try {
              expect(err).toBeUndefined();
              expect(subscribeParams).toEqual({ a: 1 });
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const { result } = notificationParams;
              const { type, value } = result;
              expect(type).toEqual({
                kind: 'column',
                cellType: { kind: 'number' },
                indexedBy: null,
              });
              expect(typeof value).toEqual('function');
              const resultValue = await all(value(1, 3));
              expect(resultValue).toMatchObject([N(11), N(12)]);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        });
      });
    },
    ONE_MINUTE_MS
  );

  it(
    'can send and receive tabular results',
    () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>((resolve, reject) => {
        runTest({
          subscribe: (options, notify) => {
            expect(omit(options, 'newSubscriptionId')).toEqual({ a: 1 });
            const result: Result.Result = {
              type: {
                kind: 'table',
                columnTypes: [{ kind: 'number' }, { kind: 'number' }],
                columnNames: ['a', 'b'],
                indexName: null,
              },
              value: [
                [N(10), N(11), N(12)],
                [N(13), N(14), N(15)],
              ],
              meta: () => ({
                labels: Promise.resolve([['a', 'b', 'c']]),
              }),
            };
            setTimeout(() => {
              notify({ result });
            }, 0);

            return noop;
          },
          subscribeParams: { a: 1 },
          notify: async (err, subscribeParams, notificationParams) => {
            try {
              expect(err).toBeUndefined();
              expect(subscribeParams).toEqual({ a: 1 });
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const { result } = notificationParams;
              const { type, value } = result;
              expect(type).toEqual({
                kind: 'table',
                columnTypes: [{ kind: 'number' }, { kind: 'number' }],
                columnNames: ['a', 'b'],
                indexName: null,
              });
              expect(value).toHaveLength(2);
              const [col1, col2] = value;
              const col1ResultValue = await all(col1());
              expect(col1ResultValue).toMatchObject([N(10), N(11), N(12)]);
              const col2ResultValue = await all(col2());
              expect(col2ResultValue).toMatchObject([N(13), N(14), N(15)]);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        });
      });
    },
    ONE_MINUTE_MS
  );

  it(
    'can send and receive partial tabular results',
    () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>((resolve, reject) => {
        runTest({
          subscribe: (options, notify) => {
            expect(omit(options, 'newSubscriptionId')).toEqual({ a: 1 });
            const result: Result.Result = {
              type: {
                kind: 'table',
                columnTypes: [{ kind: 'number' }, { kind: 'number' }],
                columnNames: ['a', 'b'],
                indexName: null,
              },
              value: [
                [N(10), N(11), N(12), N(13), N(14), N(15)],
                [N(16), N(17), N(18), N(19), N(20), N(21)],
              ],
              meta: () => ({
                labels: Promise.resolve([['a', 'b', 'c', 'd', 'e', 'f']]),
              }),
            };
            setTimeout(() => {
              notify({ result });
            }, 0);

            return noop;
          },
          subscribeParams: { a: 1 },
          notify: async (err, subscribeParams, notificationParams) => {
            try {
              expect(err).toBeUndefined();
              expect(subscribeParams).toEqual({ a: 1 });
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const { result } = notificationParams;
              const { type, value } = result;
              expect(type).toEqual({
                kind: 'table',
                columnTypes: [{ kind: 'number' }, { kind: 'number' }],
                columnNames: ['a', 'b'],
                indexName: null,
              });
              expect(value).toHaveLength(2);
              const [col1, col2] = value;
              const col1ResultValue = await all(col1(1, 3));
              expect(col1ResultValue).toMatchObject([N(11), N(12)]);
              const col2ResultValue = await all(col2(1, 3));
              expect(col2ResultValue).toMatchObject([N(17), N(18)]);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        });
      });
    },
    ONE_MINUTE_MS
  );

  it(
    'can send and receive columns of columns',
    () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>((resolve, reject) => {
        runTest({
          subscribe: (options, notify) => {
            expect(omit(options, 'newSubscriptionId')).toEqual({ a: 1 });
            const result: Result.Result = {
              type: {
                kind: 'table',
                columnTypes: [
                  {
                    kind: 'column',
                    cellType: { kind: 'number' },
                    indexedBy: null,
                  },
                  { kind: 'number' },
                ],
                columnNames: ['a', 'b'],
                indexName: null,
              },
              value: [
                [
                  [N(10), N(11), N(12), N(13), N(14), N(15)],
                  [N(100), N(110), N(120), N(130), N(140), N(150)],
                ],
                [N(16), N(17), N(18), N(19), N(20), N(21)],
              ],
              meta: () => ({
                labels: Promise.resolve([['a', 'b', 'c', 'd', 'e', 'f']]),
              }),
            };
            setTimeout(() => {
              notify({ result });
            }, 0);

            return noop;
          },
          subscribeParams: { a: 1 },
          notify: async (err, subscribeParams, notificationParams) => {
            try {
              expect(err).toBeUndefined();
              expect(subscribeParams).toEqual({ a: 1 });
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const { result } = notificationParams;
              const { type, value, meta } = result;
              expect(type).toEqual({
                kind: 'table',
                columnTypes: [
                  {
                    kind: 'column',
                    cellType: { kind: 'number' },
                    indexedBy: null,
                  },
                  { kind: 'number' },
                ],
                columnNames: ['a', 'b'],
                indexName: null,
              });
              expect(value).toHaveLength(2);
              const [col1, col2] = value;
              const col1ResultValue = await all(col1());
              expect(col1ResultValue).toHaveLength(2);
              const [col11, col12] = col1ResultValue as Result.OneResult[];
              const col11ResultValue = await all(
                getResultGenerator(col11)(1, 3)
              );
              expect(col11ResultValue).toMatchObject([N(11), N(12)]);
              const col12ResultValue = await all(
                getResultGenerator(col12)(1, 3)
              );
              expect(col12ResultValue).toMatchObject([N(110), N(120)]);
              const col2ResultValue = await all(col2(1, 3));
              expect(col2ResultValue).toMatchObject([N(17), N(18)]);
              await expect(meta().labels).resolves.toMatchInlineSnapshot(`
                [
                  [
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                  ],
                ]
              `);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        });
      });
    },
    ONE_MINUTE_MS
  );
});
