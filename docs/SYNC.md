# Document Synchronization

Ever wonder how we keep notebooks synchronized and, at the same time, allow users to edit them while offline?

We use, underneath it all, a mathematical principle called Conflict-free Replicated Data Types, (CRDTs) and these are data types that have some nice properties like strong eventual consistency, which is a long-winded way of saying that, no matter what the order of network message delivery on each replica, all replicas eventually converge to the same value.

We implement these using a neat library named [Y.js](https://yjs.dev) and some sauce on top of it.

The libraries that are envolved in this synchronization business on the client are:

- [`libs/docsync`](../libs/docsync/) - editor setup and some hooks
- [`libs/slate-yjs`](../libs/slate-yjs/)
- [`libs/y-indexeddb`](../libs/y-indexeddb/)
- [`libs/y-websocket`](../libs/y-websocket/)

## Overall synchronization algorithm

But we're getting ahead of ourselves.

When a user makes a change to the document, that change appears as a slate operation. The `libs/slate-yjs` library captures that and turns it into a Y.js operation that is applied on the Y.js document. This operation is then saved into local storage using the `libs/y-indexeddb` library and sent to the server via web-socetks using the `libs/y-websocket` library.

This operation then travels to the server, where it is processed (in the [`libs/lambdas/src/ws`](../libs/lambdas/src/ws/) entry points), stored (using the [`libs/y-dynamodb`](../libs/y-dynamodb/) library) and sent to other online clients using the `libs/y-lambdawebsocket` library).

This server-side orchestration is performed by the [`libs/sync-connection-lambdas`](../libs/sync-connection-lambdas/) library.

## Awareness

Even though not persisted, Y.js has an [Awareness facility](https://docs.yjs.dev/api/about-awareness) that allows you to broadcast things like cursor position, selection and some other meta-data to other connected clients in real-time.

We implement the backend part of this also using the `slate-yjs` library.
