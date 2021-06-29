# runtime

Client interface to the runtime.

The user of the runtime should be able to:

- Identify the user
- Organising: manage workspaces, folders, most recent pads
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
- Computation
  - Ask to parse type-check a pad. Get the errors with block and location of each error encountered.
  - Ask for a given value on a given line in a given block. Get informed about both the type and the result value.

## Import

```js
import { DeciRuntime } from '@decipad/runtime';
```

## API

All values are provided as a subscription, calling the observer provided by the client.

### Runtime lifecycle

```js
// Create the runtime
const userId: string = ...
const actorId: string = ...
const deci = new DeciRuntime({ userId, actorId })

// ...

deci.stop() // stops all observables / subjects / subscriptions
```

### Identify

You can hook it to your session provider:

```js
const session: Session = ...

deci.setSession(session)
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


### Pads


#### Editing a pad's contents

```js
const createIfAbsent = true;
const editorModel = deci.startPadEditor(padId, createIfAbsent);
const value = editorModel.getValue(); // put this as initial value of the UI editor

const subscription = editorModel.slateOps().subscribe((slateOp) => {
  // insert into UI editor
});

// also send slate operations that represent changes of the UI editor:
uiEditor.on('change', () => editorModel.sendSlateOps(uiEditor.operations));

// ...

subscription.unsubscribe();

editorModel.stop(); // important to release resources
```

### Evaluating a pad

```js
const editorModel = deci.pads.editor(padId);

const result = await editorModel.valueAt('block id', lineNumber);
```

result is a ComputationResult:

```js
{
  type: Type | TableType | undefined
  value: Interpreter.Result | undefined
  errors: ComputationError[]
}
```

### Getting a shared websocket

To limit the number of open websockets, you can reuse the sync websocket by using `runtime.websocketImpl()` like this:

```js
const WebSocketClass = runtime.websocketImpl();
const urlString = 'some bogus url string';
// the URL string here doesn't matter because it will always return
// a websocket to the predetermined websocket server.
const websocket = new WebSocketClass(urlString);
```

```

## Running unit tests

Run `nx test runtime` to execute the unit tests via [Jest](https://jestjs.io).
