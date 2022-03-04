/* eslint-env jest */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-title */
/* eslint-disable jest/no-export */

import sandbox from './sandbox';
import { createSandboxEnv, Env } from './sandbox-env';
import callGraphql, { gql } from './call-graphql';
import call from './call-simple';
import auth from './auth';
import { websocketURL } from './websocket-url';
import { createWebsocket } from './websocket';

export interface TestContext {
  test: typeof it;
  beforeAll: typeof beforeAll;
  graphql: ReturnType<typeof callGraphql>;
  http: ReturnType<typeof call>;
  websocketURL: () => string;
  websocket: (docId: string, token: string) => WebSocket;
  auth: ReturnType<typeof auth>;
  gql: typeof gql;
}

function cleanse(env: Env): Env {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, ...rest } = env;
  const cleansed: Record<string, string | undefined> = {
    ...rest,
  };
  if (AWS_ACCESS_KEY_ID) {
    cleansed.AWS_ACCESS_KEY_ID = '***REDACTED***';
  }
  if (AWS_SECRET_ACCESS_KEY) {
    cleansed.AWS_SECRET_ACCESS_KEY = '***REDACTED***';
  }
  return cleansed;
}

export function testWithSandbox(
  description: string,
  spec: (ctx: TestContext) => void
): void {
  let shownEnv = false;
  let env: Env;

  const sandboxStartedPromise: Promise<void> = new Promise((resolve) => {
    const workerId = process.env.JEST_WORKER_ID;
    if (typeof workerId === 'undefined') {
      throw new Error(
        'expected Jest worker id to be defined in process.env.JEST_WORKER_ID'
      );
    }
    createSandboxEnv(Number(workerId)).then((sandboxEnv) => {
      [env] = sandboxEnv;
      const [, config] = sandboxEnv;

      testContext.graphql = callGraphql(config);
      testContext.http = call(config);
      testContext.auth = auth(config);
      testContext.websocketURL = () => websocketURL(config);
      testContext.websocket = (token: string) => createWebsocket(config, token);

      sandbox.start(env, config).then(resolve);
    });
  });

  const testContext: TestContext = {
    test: getTestFunction(),
    gql,
  } as TestContext;

  global.describe(description, () => {
    global.beforeAll(() => sandboxStartedPromise, 20e3);

    global.afterAll(() => sandbox.stop());

    spec(testContext as TestContext);
  });

  function wrap(
    fn: (arg?: unknown) => void | Promise<unknown>
  ): (arg?: unknown) => Promise<unknown> {
    return async (...args: [firstArg?: unknown]) => {
      const firstArg = args[0];
      await sandboxStartedPromise;
      try {
        return firstArg !== undefined ? await fn(firstArg) : await fn();
      } catch (err) {
        showEnv();
        throw err;
      }
    };
  }

  function wrapTestHelper(
    targetFn: (desc: string, fn: () => void | Promise<unknown>) => unknown
  ) {
    return (desc: string, fn: () => void | Promise<unknown>) => {
      targetFn(desc, wrap(fn));
    };
  }

  function showEnv() {
    if (!shownEnv) {
      shownEnv = true;
      console.log(
        `Printing sandbox environment because an error happened:\n${JSON.stringify(
          cleanse(env),
          null,
          '\t'
        )}`
      );
    }
  }

  function getTestFunction(): typeof global.test {
    const testFn = function testFn(
      description: string,
      fn: () => Promise<unknown> | void,
      testTimeout = 10e3
    ) {
      return it(description, wrap(fn), testTimeout + 10e3);
    };
    testFn.only = wrapTestHelper(it.only);
    testFn.skip = wrapTestHelper(it.skip);
    testFn.todo = it.todo;
    testFn.concurrent = wrapTestHelper(it.concurrent);
    testFn.each = (collection: Array<unknown>) =>
      wrapTestHelper(it.each(collection));
    return testFn as typeof global.test;
  }
}
