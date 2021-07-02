import { ApolloLink, Observable, FetchResult } from '@apollo/client/core';
import { print } from 'graphql';
import { createClient } from 'graphql-ws';

function createLink(webSocketImpl: typeof WebSocket, keepAlive = 0) {
  const client = createClient({
    url: `ws://localhost:${process.env.PORT}/graphql`,
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
              { [key: string]: any },
              Record<string, any>,
              Record<string, any>
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
            console.trace(err);
            if (err instanceof Error) {
              return observer.error(err);
            }

            if (err instanceof CloseEvent) {
              return observer.error(
                // reason will be available on clean closes
                new Error(
                  `Socket closed with event ${err.code} ${err.reason || ''}`
                )
              );
            }

            return observer.error(err);
          },
        }
      );
    });
  });
}

export default createLink;
