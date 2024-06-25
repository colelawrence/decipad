/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */
import './workerPolyfills';
// eslint-disable-next-line no-restricted-imports
import { getComputer } from '@decipad/computer';
import type { CreateWorkerWorkerOptions } from '@decipad/remote-computer-worker/worker';
import { createWorkerWorker } from '@decipad/remote-computer-worker/worker';
import { fnQueue } from '@decipad/fnqueue';
import { getDefined } from '@decipad/utils';
import { decodeComputeDeltaRequest } from '../decode/decodeComputeDeltaRequest';
import { subjectEncoders } from '../encode/subjectEncoders';
import type { SerializedComputeDeltaRequest } from '../types/serializedTypes';
import type { ListenerMethodName } from '../types/listeners';
import type { SubjectEncoder } from '../types/types';
import type {
  TCommonSubjectName,
  TCommonTypedSubscriptionParams,
  TCommonSubject,
  TCommonSerializedSubject,
} from '../types/common';
import { getObservable } from '../utils/getObservable';
import { createWorkerHandler as createCreateWorkerHandler } from './createRpcEncoder';
import { decodeSubscriptionArgs } from '../decode/decodeSubscriptionArgs';
import type { Subscription } from 'rxjs';
import { createComputerResultsCache } from './computerResultsCache';
import { ComputerResultsCache } from './types';

if (typeof importScripts === 'function') {
  const computer = getComputer();

  const subscribe: CreateWorkerWorkerOptions<
    TCommonTypedSubscriptionParams<TCommonSubjectName>,
    [string, TCommonSubject<TCommonSubjectName>],
    TCommonSerializedSubject<TCommonSubjectName>
  >['subscribe'] = (options, notify) => {
    const { type: methodName, params } = options;
    if (!Array.isArray(params)) {
      throw new TypeError(
        `error in subscribing ${methodName} params must be an array`
      );
    }
    let subscription: Subscription | undefined;
    let unsubscribed = false;
    decodeSubscriptionArgs(methodName, params)
      .then((deserializedParams) => {
        const observable = getObservable(
          computer,
          methodName,
          deserializedParams
        );
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        subscription = observable.subscribe(async (value) => {
          if (!unsubscribed) {
            notify([methodName, await value]);
          }
        });
      })
      .catch((error) => {
        console.error('Error subscribing to remote', error);
      });
    return () => {
      unsubscribed = true;
      subscription?.unsubscribe();
    };
  };

  const { rpc, remoteValueStore } = createWorkerWorker({
    postMessage: (data) => {
      self.postMessage(data);
    },
    readMessages: (cb) => {
      const previousOnMessage = self.onmessage;
      self.onmessage = (ev) => {
        cb(ev);
      };
      return () => {
        self.onmessage = previousOnMessage;
      };
    },
    subscribe,
    serializeNotificationFromStore: (valueStore) => {
      return async (subscriptionId, [methodName, value]) => {
        const encode: SubjectEncoder<TCommonSubjectName> = getDefined(
          subjectEncoders[methodName as ListenerMethodName],
          `no subject encoder for method ${methodName}`
        );
        const encodedValue = await encode(value, valueStore);
        return {
          subscriptionId,
          notification: encodedValue,
        };
      };
    },
    serviceId: 'remote-computer-worker',
  });

  const queue = fnQueue();

  rpc.expose<[SerializedComputeDeltaRequest]>(
    'pushComputeDelta',
    async ([req]) =>
      queue.push(async () => {
        await rpc.isReady;
        return computer.pushComputeDelta(await decodeComputeDeltaRequest(req));
      })
  );

  const createWorkerHandler = createCreateWorkerHandler(rpc.isReady);

  rpc.expose(
    'expressionResult',
    createWorkerHandler(computer, remoteValueStore, 'expressionResult')
  );

  rpc.expose(
    'getStatement',
    createWorkerHandler(computer, remoteValueStore, 'getStatement')
  );

  rpc.expose(
    'variableExists',
    createWorkerHandler(computer, remoteValueStore, 'variableExists')
  );

  rpc.expose(
    'getAvailableIdentifier',
    createWorkerHandler(computer, remoteValueStore, 'getAvailableIdentifier')
  );

  rpc.expose(
    'expressionType',
    createWorkerHandler(computer, remoteValueStore, 'expressionType')
  );

  rpc.expose(
    'computeDeltaRequest',
    createWorkerHandler(computer, remoteValueStore, 'computeDeltaRequest')
  );

  rpc.expose(
    'getUnitFromText',
    createWorkerHandler(computer, remoteValueStore, 'getUnitFromText')
  );

  rpc.expose(
    'getSymbolDefinedInBlock',
    createWorkerHandler(computer, remoteValueStore, 'getSymbolDefinedInBlock')
  );

  rpc.expose(
    'getNamesDefined',
    createWorkerHandler(computer, remoteValueStore, 'getNamesDefined')
  );

  rpc.expose('flush', createWorkerHandler(computer, remoteValueStore, 'flush'));

  // Cache results when initializing
  let resultsCache: ComputerResultsCache | undefined;
  rpc.expose<{ notebookId: string }>(
    'initializeComputer',
    async ({ notebookId }) => {
      resultsCache = createComputerResultsCache(computer, notebookId);
      console.log(
        'Remote computer worker initialized to notebook Id:',
        notebookId
      );
    }
  );

  // Termination
  rpc.expose('terminate', () => {
    computer.terminate().catch((err) => {
      console.error('Error terminating computer', err);
    });
    resultsCache?.terminate();
  });

  console.log('Computer worker started');
}
export default {};
