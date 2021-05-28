import { ApolloLink, Observable } from '@apollo/client/core';
import { print } from 'graphql';
import { createClient } from 'graphql-ws';

function createLink(webSocketImpl, keepAlive = 0) {
  const client = createClient({
    url: 'ws://localhost:3333/graphql',
    webSocketImpl,
    keepAlive,
  });

  return new ApolloLink((operation) => {
    return new Observable((observer) => {
      client.subscribe(
        { ...operation, query: print(operation.query) },
        {
          next(payload) {
            observer.next(payload);
          },
          complete() {
            observer.complete();
          },
          error(err) {
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
