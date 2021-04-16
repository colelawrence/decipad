# runtime

Client interface to the runtime.

The user of the runtime should be able to:

* Identify the user
* Organising: manage workspaces, folders, most recent pads
* Syncing:
  * Receiving remote changes
  * Sending local changes
* Persistence:
  * Load a pad
  * Save a pad
  * Know if a pad has been fully synced with the back-end
* Remote presence while editing a pad
  * Inform the user of the identity of the users editing the pad
  * Inform the user of other users' cursor positions
  * Inform the user of other users'
* Computation
  * Ask to parse type-check a pad. Get the errors with block and location of each error encountered.
  * Ask for a given value on a given line in a given block. Get informed about both the type and the result value.


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
const deci = new DeciRuntime(userId, actorId)

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
const observer = ({ error, loading, data }) => { /**/ }
````

The type of the `data` element depends on the data type you're subscribing to.

To subscribe, you have to do the following:

```js
const subscription = observable.subscribe(observer)
````

To unsubscribe, you should do the following:

```js
subscription.unsubscribe() // observable won't be called again after this
```

### List subscriptions

When you subscribe to a list (like a list of Workspaces or a list of Tags), you subscribe to a value that is an array of ids. These ids are strings.

Then, in each UI component that renders each element, you should subscribe to the detail of the object, like this:

```js
const Workspace = ({ id }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [workspace, setWorkspace] = useState(null)

  useEffect(() => {
    const observable = deci.workspaces.get(id)
    const subscription = observable.subscribe(({ loading, data: workspace, error }) => {
      setLoading(loading)
      setError(error)
      setWorkspace(workspace)
    })

    return () => subscription.unsubscribe()
  }, [id])
}
````

Here are some examples:


### Workspaces


#### Get Workspace

```js
const workspaceObservable = deci.workspaces.get(id)
const subscription = workspaceObservable.subscribe(({ loading, data: workspace, error }) => {
  console.log({ loading, error, workspace })
})

/*...*/

subscription.unsubscribe()
```

#### List workspaces

```js
import { Observable, Subscription } from 'rxjs';

const workspaceList : Observable<Workspace[]> = deci.workspaces.list();

const listObserver = ({ loading: boolean, error: Error, data: Id[] }) => {
  if (!loading) {
    console.log('new list', data)
  }
}

const subscription : Subscription = workspaceList.subscribe(listObserver);

// ...

subscription.unsubscribe()
````

#### Create workspace

```js
import { nanoid } from 'nanoid'

const permission: Permission = {
  id: nanoid(),
  role: `user:${user.id}`,
  isOwner: true,
  canRead: true,
  canWrite: true
}

const workspace : Workspace = {
  id: nanoid(),
  name,
  permissions: [permission],
  ...
};
await deci.workspaces.create(workspace);
````

#### Update workspace

You can pass an id of the workspace and an object with the properties that you want to change:

```js
await deci.workspaces.update(id, { name: 'new workspace name'})
```

#### Delete workspace

```js
await deci.workspaces.delete(workspace.id);
```

#### Insert Workspace in list

```js
await deci.workspaces.insertAt(pos, workspace.id)
````

#### Remove Workspace

```js
await deci.workspaces.remove(workspace.id)
````

#### Move Workspace within list

```js
await deci.workspaces.move(workspace, newPos)
````

### Pads

#### List pads

You can list all the pads directly inside a workspace:

```js
const padIds : Observable<Id[]> = deci.workspace(id).pads.list()
const padListObserver = {
  next: (list: Pad[]) => { console.log('new pad list', list) },
  error: (err: Error) => { console.error(err) }
}
const subscription : Subscription = padList.subscribe(padListObserver)

// ...

subscription.unsubscribe()
```

You can also list a pad inside a folder:

```js
const padList : Observable<Pad[]> = deci.workspace(id).pads.list()

// etc..
```

#### Create pad metadata

```js
const pad = {
  id: nanoid(),
  name: 'Some name',
  workspaceId: workspace.id,
  folderId: folder.id,
  lastUpdatedAt: new Date()
}

await deci.workspace(id).pads.create(pad)
```

#### Update a pad metadata

You can partially update the properties of a pad:

```js
const newPadProps = { name: 'new pad name' }

setSaving(true)
try {
  await deci.workspace(id).pads.update(id, newPadProps)
} catch (err) {
  showAnErrorMessage(err.message)
} finally {
  setSaving(false)
}
```

### Loading a pad metadata:

```js
({ padId }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [value, setValue] = useState(null)

  useEffect(() => {
    const observable = deci.workspace(workspaceId).pads.pad(padId)

    const sub = return observable.subscribe(({ loading, error, data }) => {
      setLoading(loading)
      setError(error)
      setValue(data)
    })

    return sub.unsubscribe.bind(sub)
  }, [padId])
}
```

#### Updating a pad

You can move a pad to another workspace while at the same time updating other properties:

```js
const newPadProps = {
  name: 'new pad name',
  workspaceId: newWorkspaceId
}
const newPositionInNewFolder = 2 // defaults to 0

await deci.pads.update(padId, newPadProps, newPositionInNewFolder)
```

If the only thing you want is to move a pad without updating any other prop, you can simply:

```js
await deci.pads.move(padId, targetWorkspaceId, insertAtPos /* default = 0 */)
```

#### Remove a pad

```js
await deci.pads.removePad(padId)
```

#### Editing a pad's contents

```js
const editorModel = deci.pads.editor(padId)
const value = editorModel.getValue() // put this as initial value of the UI editor

const subscription = editorModel.slateOps().subscribe((slateOp) => {
  // insert into UI editor
})

// also send slate operations that represent changes of the UI editor:
uiEditor.on('change', () => editorModel.sendSlateOps(uiEditor.operations))

// ...

subscription.unsubscribe()

editorModel.stop() // important to release resources
````

### Evaluating a pad

```js
const editorModel = deci.pads.editor(padId)

const result = await editorModel.valueAt('block id', lineNumber)
```

result is a ComputationResult:

```js
{
  type: Type | TableType | undefined
  value: Interpreter.Result | undefined
  errors: ComputationError[]
}
````

## Running unit tests

Run `nx test runtime` to execute the unit tests via [Jest](https://jestjs.io).
