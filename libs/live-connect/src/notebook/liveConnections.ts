import {
  AnyElement,
  LiveConnectionElement,
  ELEMENT_LIVE_CONNECTION,
  MyValue,
  LiveDataSetElement,
  LiveQueryElement,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { isEmpty } from 'lodash';
import { BehaviorSubject, SubscriptionLike } from 'rxjs';
import { ConnectionResult, Observe } from '../types';

type LiveConnectionElementWithConnections =
  | LiveConnectionElement
  | (LiveDataSetElement & {
      result?: Result;
    });

type Result = {
  subject: BehaviorSubject<ConnectionResult | undefined>;
  subscription: SubscriptionLike;
};

type BlockId = string;

type Connections = Map<BlockId, LiveConnectionElementWithConnections>;

const isLiveConnection = (block: AnyElement): boolean => {
  return block.type === ELEMENT_LIVE_CONNECTION;
};

const diffAndProcessNew = async (
  oldConnections: Connections,
  newConnections: Connections,
  observeExternal: Observe
): Promise<Connections> => {
  const newConnectionsResult = new Map(oldConnections);
  const connectionsToAdd = Array.from(newConnections.entries()).filter(
    ([key]) => !oldConnections.has(key)
  );
  for (const [key, conn] of connectionsToAdd) {
    const subject = new BehaviorSubject<ConnectionResult | undefined>(
      undefined
    );
    // eslint-disable-next-line no-await-in-loop
    const subscription = await observeExternal(
      {
        params: {
          url: conn.url,
          proxy: conn.proxy,
          source: conn.source,
          useFirstRowAsHeader: conn.isFirstRowHeaderRow,
          columnTypeCoercions: conn.columnTypeCoercions,
          liveQuery: conn.liveQuery as LiveQueryElement,
        },
        notify: (result) => {
          subject.next({ source: conn, result });
        },
      },
      true
    );
    if (subscription) {
      newConnectionsResult.set(key, {
        ...conn,
        result: {
          subject,
          subscription,
        },
      });
    }
  }

  return newConnectionsResult;
};

const diffAndUnsubscribeOld = (
  oldConnections: Connections,
  newConnections: Connections
): void => {
  const old = Array.from(oldConnections.entries()).filter(
    ([key]) => !newConnections.has(key)
  );

  for (const [, sub] of old) {
    if (!isEmpty(sub.result)) {
      (sub.result as Result).subscription.unsubscribe();
    }
  }
};

const diffAndProcess = async (
  oldConnections: Connections,
  newConnections: Connections,
  observeExternal: Observe
): Promise<Connections> => {
  const connections = await diffAndProcessNew(
    oldConnections,
    newConnections,
    observeExternal
  );

  diffAndUnsubscribeOld(oldConnections, newConnections);

  return connections;
};

interface LiveConnections {
  update: (value: MyValue) => Promise<void>;
  destroy: () => void;
  getExternalData$: BehaviorSubject<Map<string, ConnectionResult>>;
}

export const liveConnections = (observe: Observe): LiveConnections => {
  let connections: Connections = new Map();
  const subscriptions: Map<string, SubscriptionLike> = new Map();
  const results: Map<string, ConnectionResult> = new Map();

  const getExternalData$ = new BehaviorSubject<Map<string, ConnectionResult>>(
    new Map()
  );

  const update = async (value: MyValue) => {
    const newLiveConnections = value
      .filter(isLiveConnection)
      .reduce<Connections>((connectionsAcc, elem: AnyElement) => {
        assertElementType(elem, ELEMENT_LIVE_CONNECTION);
        connectionsAcc.set(elem.id, elem);
        return connectionsAcc;
      }, new Map());

    connections = await diffAndProcess(
      connections,
      newLiveConnections,
      observe
    );

    // subscribe to new connections
    for (const [key, conn] of connections) {
      if (!subscriptions.has(key)) {
        const newSubscription = (conn.result as Result)?.subject.subscribe(
          (result) => {
            if (result) {
              results.set(key, result);
            } else {
              results.delete(key);
            }
            getExternalData$.next(results);
          }
        );
        if (newSubscription) {
          subscriptions.set(key, newSubscription);
        }
        // retrieve and expose current value
        const currentValue = (conn.result as Result)?.subject.getValue();
        if (currentValue) {
          results.set(key, currentValue);
          getExternalData$.next(results);
        }
      }
    }

    // unsubscribe from old connections
    for (const [key, sub] of subscriptions) {
      if (!connections.has(key)) {
        sub.unsubscribe();
        subscriptions.delete(key);
      }
    }
  };

  const destroy = () => {
    for (const [, sub] of subscriptions) {
      sub.unsubscribe();
    }
    subscriptions.clear();
    results.clear();
  };

  return { update, getExternalData$, destroy };
};
