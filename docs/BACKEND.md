# Back-end development

Are you a developer that needs to change or add something to the Deci back-end? This is for you.

## Resources

Deci is cloud-native. It was born it the cloud and will continue to live there. As its home, it chose to live on AWS, mainly because AWS is the most reliable, featureful and cheap cloud provider.

But it's low-level as heck. Hard to do anything really. Attributes this, roles that, policy that, XML XML...

That's why we're using [Architect](https://arc.codes).

Architect does several things for us: it promotes infra-as-code, automates deployments and runs a local sandbox that emulates.

No need to use Docker, waiting minutes to bootstrap Java servers that are _still_ an emulation of the real thing.

Instead, you can simply run `yarn serve:all`.

## Resource descriptor

The file [`apps/backend/app.arc`](../apps/backend/app.arc) contains a high-level description of the resources of each instance of Deci, namely:

- Lambda functions
- API gateway HTTP interface
- API gateway Web-sockets interface
- SQS queues
- DynamoDB tables and indexes

## Building

Before you can run the back-end,you'll have to build it by running `yarn backend:build`.

This compiles the back-end code for the lambda functions (in [`libs/lambdas`](../libs/lambdas/))and deploys it in [`apps/backend/src`](../apps/backend/src/).

> We use [esbuild](https://esbuild.github.io) for building the back-end.

### Watch-building

You can also, on a separate terminal, start a watch that builds the back-end every time there's a file change:

```bash
yarn build:backend:watch
```

> If you're running a server through `yarn serve:backend` or `yarn serve:all`, this will already run a watch that compiles and reloads the lambda functions every time a file changes.

## The local sandbox

You can start the back-end server using `yarn serve:backend` or, altogether with the front-end server, with `yarn serve:all`.

This will use [Architect](https://arc.codes) to run a local sandbox that emulates some parts of the AWS infra-structure, namely:

- API gateway
- Lambda runtime
- DynamoDB tables (which are not persistent, so if you stop the server, the data will be gone).
- SQS queues
- S3 buckets (through a plugin of our authoring)

It's not a perfect replica that emulates every small aspect of the AWS behavior (there are some pretty gnarly differences, which were hard learnings - like the AWS max size for table records, the max size of Websocket messages or even the fact that API Gateway does not support binary-encoded Websocket streams), but it's probably good enough for local development.

### Auto-reload

The server auto-reloads the lambda functions that change, and it also recompiles the lambdas for which dependencies have changed.

## HTTP end-points

The HTTP endpoints are described in the [`app.arc`](../apps/backend/app.arc) file their Lambda function entry points are in [`libs/lambdas`](../libs/lambdas/).

All API endpoints (except for the GraphQL one) are prefixed with `/api/` (because we wanted to avoid the overhead and bugginess surrounding CORS).

There are two important groups of end-points:

- /api/auth/\* - deals with everything authentication-related
- /graphql - the entire Deci GraphQL service

## DynamoDB tables

The Dynamo tables and their indexes are also briefly described in the [`app.arc`](../apps/backend/app.arc) file.

We use them thruoghout our lambda functions by using the `libs/tables` library, which in turn wraps the `@architect/functions` database implementation with some nice goodies.

### Nice goodies

Since Architect didn't implement DynamoDB change streams, we had to create our own poor-mans version of it.

The goal here is to add some asynchronous processes triggered by changes in the database.

For this we use SQS, which then automatically triggers the corresponding `changes-*` queue.

Queue processing entry points are implemented in [`libs/lambdas/src/queues`](../libs/lambdas/src/queues/).

Also, the `libs/tables` library also adds some utilities, like a `table.create(...)` and a `table.batchGet(...)`.

## Typescript types

The tables and some GraphQL objects are stronly typed in Typescript, inside the [`libs/backendtypes`](../libs/backendtypes/) library.

## GraphQL server

Besides authentication, the front-end mainly interacts with out back-end via a GraphQL API, which has its entry point in [`libs/lambdas/src/http/any-graphql`](../libs/lambdas/src/http/any-graphql/) and uses the [`libs/graphqlserver`](../libs/graphqlserver/) library for its implementation.

Inside this last library, the source files are divided by realm (users, pads (notebooks), workspaces, etc).

Some of them use the generic [`libs/graphqlresource`](../libs/graphqlresource/) library, which is a generic resource implementation that provides:

- some basic authentication and authorization verifications
- create, getById, update, remove
- manage permissions, sharing and unsharing

## Back-end tests

Back-end tests are implemented in [`apps/backend/tests`](../apps/backend/tests/) and spaws several sandboxes for running the tests against.

## PR deploys

Each Deci pull-request on Github spawns an independent stack that contains a complete replica of our production stack (minus the CDN).

We use some scripts over [Architect](https://arc.codes) to achieve this.

## Dev and production deploys

Same as above
