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

So, to change, remove or add a lambda or some of the function, you should bundle it using, from the root folder:

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