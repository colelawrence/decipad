import { ApolloLink, Observable, FetchResult } from '@apollo/client/core';
import { print } from 'graphql';
import { createClient } from 'graphql-ws';

export default function createWebsocketLink({ apiPort }: { apiPort: number }) {
  return function createLink(
    webSocketImpl: typeof WebSocket,
    keepAlive = 0
  ): ApolloLink {
    const client = createClient({
      url: `ws://localhost:${apiPort}/graphql`,
      webSocketImpl,
      keepAlive,
    });

    return new ApolloLink((operation) => {
      return new Observable((observer) => {
        return client.subscribe(
          { ...operation, query: print(operation.query) },
          {
            next(
              payload: FetchResult<
                { [key: string]: unknown },
                Record<string, unknown>,
                Record<string, unknown>
              >
            ) {
              observer.next(payload);
            },
            complete() {
              observer.complete();
            },
            error(err) {
              if (!err) {
                return;
              }
              // eslint-disable-next-line no-console
              console.trace(err);
              if (err instanceof Error) {
                observer.error(err);
                return;
              }

              if (err instanceof CloseEvent) {
                observer.error(
                  // reason will be available on clean closes
                  new Error(
                    `Socket closed with event ${err.code} ${err.reason || ''}`
                  )
                );
                return;
              }

              observer.error(err);
            },
          }
        );
      });
    });
  };
}
