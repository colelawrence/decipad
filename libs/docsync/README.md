# docsync

Client interface to the doc synchronization.

The user of the runtime should be able to:

- Syncing:
  - Receiving remote changes
  - Sending local changes
- Persistence:
  - Load a pad
  - Save a pad
  - Know if a pad has been fully synced with the back-end
- Remote presence while editing a pad
  - Inform the user of the identity of the users editing the pad
  - Inform the user of other users' cursor positions
  - Inform the user of other users'

## Import

```js
import { DocSync } from '@decipad/docsync';
```

## API

All values are provided as a subscription, calling the observer provided by the client.

### DocSync lifecycle

```js
// Create the runtime
const userId: string = ...
const actorId: string = ...
const sync = new DocSync({ userId, actorId })

// ...

sync.stop() // stops all observables / subjects / subscriptions
```

### Observables

Lists and elements implement the Observer pattern. All observers emit objects with the following shape:

```js
{
  error: Error | null, // for when an error occurs
  loading: boolean, // true when the element is loading. Emitted immediately on subscription
  data: T // the data with the specific type of element or list composition
}
```

### Subscriptions

A list or an individual element is an observable to which you can subscribe to.

To subscribe, you have to supply an observer. An observer can be a function that has the following signature:

```js
const observer = ({ error, loading, data }) => {
  /**/
};
```

The type of the `data` element depends on the data type you're subscribing to.

To subscribe, you have to do the following:

```js
const subscription = observable.subscribe(observer);
```

To unsubscribe, you should do the following:

```js
subscription.unsubscribe(); // observable won't be called again after this
```


### Notebooks


#### Editing a notebooks's contents

```js
const syncEditor = sync.edit(docId);
const value = syncEditor.getValue(); // put this as initial value of the UI editor

const subscription = syncEditor.slateOps().subscribe((slateOp) => {
  // insert into UI editor
});

// also send slate operations that represent changes of the UI editor:
uiEditor.on('change', () => syncEditor.sendSlateOps(uiEditor.operations));

// ...

subscription.unsubscribe();

syncEditor.stop(); // important to release resources
```

### Getting a shared websocket

To limit the number of open websockets, you can reuse the sync websocket by using `sync.websocketImpl()` like this:

```js
const WebSocketClass = sync.websocketImpl();
const urlString = 'some bogus url string';
// the URL string here doesn't matter because it will always return
// a websocket to the predetermined websocket server.
const websocket = new WebSocketClass(urlString);
```

## Running unit tests

Run `nx test docsync` to execute the unit tests via [Jest](https://jestjs.io).
