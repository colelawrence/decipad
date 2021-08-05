/* eslint-env jest */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-title */
/* eslint-disable jest/no-export */

import sandbox from './sandbox';
import { createSandboxEnv } from './sandbox-env';
import callGraphql, { gql } from './call-graphql';
import call from './call-simple';
import auth from './auth';
import subscriptionClient from './subscription-client';

export interface TestGoodies {
  test: typeof it;
  graphql: ReturnType<typeof callGraphql>;
  http: ReturnType<typeof call>;
  subscriptionClient: ReturnType<typeof subscriptionClient>;
  auth: ReturnType<typeof auth>;
  gql: typeof gql;
}

function testWithSandbox(
  description: string,
  fn: (args: TestGoodies) => void
): void {
  let shownEnv = false;
  const workerId = process.env.JEST_WORKER_ID;
  if (typeof workerId === 'undefined') {
    throw new Error(
      'expected Jest worker id to be defined in process.env.JEST_WORKER_ID'
    );
  }
  const [env, config] = createSandboxEnv(Number(workerId));

  // enrich test function with jest test helper functions
  test.only = wrapTestHelper(it.only);
  test.skip = wrapTestHelper(it.skip);
  test.todo = it.todo;
  test.concurrent = wrapTestHelper(it.concurrent);
  test.each = (collection: Array<unknown>) =>
    wrapTestHelper(it.each(collection));

  const testGoodies = {
    graphql: callGraphql(config),
    http: call(config),
    subscriptionClient: subscriptionClient(config),
    auth: auth(config),
    gql,
    test,
  };

  return describe(description, () => {
    beforeAll(async () => {
      try {
        await sandbox.start(env, config);
      } catch (err) {
        showEnv();
      }
    }, 20000);

    afterAll(async () => {
      await sandbox.stop();
    });

    fn(testGoodies as TestGoodies);
  });

  function test(description: string, fn: () => Promise<unknown> | void) {
    return it(description, wrap(fn));
  }

  function wrap(
    fn: (arg?: unknown) => Promise<unknown> | void
  ): (arg?: unknown) => void {
    return (...args: [firstArg?: unknown]) => {
      const firstArg = args[0];
      try {
        const ret = firstArg !== undefined ? fn(firstArg) : fn();
        if (ret instanceof Promise) {
          return ret.catch((err) => {
            showEnv();
            throw err;
          });
        }
        return undefined;
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
          env,
          null,
          '\t'
        )}`
      );
    }
  }
}

export default testWithSandbox;
