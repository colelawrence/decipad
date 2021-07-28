# Deci Backend

## Run

Inside the project root folder:

```bash
$ nx serve backend
```

## Develop

We use [Architect](https://arc.codes) to develop the backend. It allows us to run a local sandbox without much complication (no Docker, only local services in npm packages).

But Architect is Javascript and we like TypeScript.

So we do our Typescript development inside the `/libs/*` folders (mainly the `services`, `lambdas` and `graphql` libs), which we compile and bundle into the `apps/backend/src` folder, where Architect can use it.

We don't rely in Architect's bundler (which zips each lambda an it's dependencies into an archive and deploys it). Instead, we bundle ech lambda's typescript source and bundle it using [esbuild](https://esbuild.github.io).

To change, remove or add a lambda or some of the functions, you should bundle it using, from the root folder:

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

## File attachments

Our GraphQL API allows users to upload attachments. Since our attachments are stored in S3, the client uploads them to S3 directly (saving us $money$).

You can check out the code to how to upload and attach a file to a pad in this test file:

[tests/attach-file.spec.ts](tests/attach-file.spec.ts)

Here is a quick overview of the process:

- Client asks for form data using our GraphQL `getCreateAttachmentForm(padId, fileName, fileType)` query. As for the fileType `argument`, you should pass in a mime type (like "text/csv", for instance).
- Client stores the returned handle and URL and creates a form programatically using the returned fields.
- Client adds the file to upload to the form "file" field.
- Client uploads the form to the given URL (returned by the previous `getCreateAttachmentForm` call).
- Client can show a progress bar.
- After the upload is successfully complete, client needs to call the `attachFileToPad(handle)`, passing in the given handle returned by the first query.
