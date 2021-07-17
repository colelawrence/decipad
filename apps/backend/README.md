# Deci Backend

## Run

Inside the project root folder:

```bash
$ nx serve backend
```

## Develop

We use [Architect](https://arc.codes) to develop the backend. It allows us to run a local sandbox without much complication (no Docker, only local services in npm packages).

But Architect is Javascript and we like TypeScript.

So we do our Typescript development inside the `lib` folder, which we compile and bundle into the `src` folder, where Architect can use it.

We don't rely in Architect's bundler (which zips each lambda an it's dependencies into an archive and deploys it). Instead, we bundle ech lambda's typescript source and bundle it using [esbuild](https://esbuild.github.io).

So, to change, remove or add a lambda or some of the functions, you should bundle it using, from the root folder:

```bash
$ npm run build:backend
```

You can also choose to continuously watch for changes by using:

```bash
$ npm run build:backend:watch
```

## GraphQL

You can run the GraphQL playground to try out the GraphQL API.

We adivise you to run that through client app (port 4200), so that you can use authenticated requests.

For that, you'll need two terminal windows. On one, you launch the backend:

```bash
$ nx serve backend
```

On the other you launch the front-end:

```bash
$ nx serve client
```

Now you can use the GraphQL playground by accessing [http://localhost:4200/graphql](http://localhost:4200/graphql).


## Code structure

The backend code structure is roughly the following:

- **lib**
  - **architect**
    - **http**: HTTP endpoint lambdas (auth, sync, validation, invites, graphql entry points)
    - **queues**: - Queue lambdas that perform async work
    - **ws**: Websocket lambdas (connect, disconnect, message)
  - **auth-flow**: authentication adaptation of next-auth, jwts, validation, ...
  - **email-templates**: only text for now
  - **graphql**: graphql, separated by realm
    - **pagination**: pagination helpers
    - **modules.ts**: puts together all graphql realms
    - Each ream has:
      - typedefs.ts : graphql typedefs
      - resolvers.ts: the respective resolvers
  - **pads**: some shared business logic for handling pads
  - **pubsub**: subscription and notification mechanisms. Used mainly for handling graphql subscriptions.
  - **queues**: shared code for queue handlers
  - **resource**: resource url encoding and decoding
  - **resource-permissions**: resource-based permission mechanisms
  - **s3**: we keep pad attachments and pad contents in S3
  - **services**: external services. Only send email for now.
  - **tables**: shared library for database-related stuff.
  - **users**: some user management business logic.
  - **workspaces**: some workspace shared business logic
  - **auth.ts**: shared authentication mechanisms
  - **authorization.ts**: shared authoritzation mechanisms
  - **config.ts**: concentrates backend config, roughly divided by realm.
  - **monitor.ts**: error reporting and tracing.
- **src**: generated src files (compiled from Typescript in `lib`) for architect.
- **tests**: back-end integration tests
- **types**: some typescript types for: Graphql, Database and Lambdas
- **app.arc**: infrastructure configuration


## File attachments

Our GraphQL API allows users to upload attachments. Since our attachments are stored in S3, the client uploads them to S3 directly (saving us $money$).

You can check out the code to how to upload and attach a file to a pad in this test file:

[tests/attach-file.spec.ts](tests/attach-file.spec.ts)

Here is a quick overview of the process:

* Client asks for form data using our GraphQL `getCreateAttachmentForm(padId, fileName, fileType)` query. As for the fileType `argument`, you should pass in a mime type (like "text/csv", for instance).
* Client stores the returned handle and URL and creates a form programatically using the returned fields.
* Client adds the file to upload to the form "file" field.
* Client uploads the form to the given URL (returned by the previous `getCreateAttachmentForm` call).
* Client can show a progress bar.
* After the upload is successfully complete, client needs to call the `attachFileToPad(handle)`, passing in the given handle returned by the first query.

