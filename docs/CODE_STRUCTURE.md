# Code Structure

Here is a quick layout of the code structure for this repo.

## apps and libs

There are two main parts for this repo: the `apps` and `libs` folders.

`apps` contain independent applications and `libs` contains a shared set of libraries.

## apps

- `apps/backend/`: this is what gets deployed into AWS. You probably won't need to touch this, except fopr the tests:
  - `app.arc`: Architect descriptor for the application (back-end infra-structure)
  - `tests/`: contains some integration tests for the back-end API
  - `scripts/`: local development sandbox-related scripts
  - `src/`: the bundling of lambda functions (coming from compiling `libs/lambdas`)
- `apps/docs/`: Docusaurus-based website that holds the documentation for how to use our product
- `apps/e2e/`: End-to-end tests using Playwright
- `apps/frontend/`: Our client application. Contains the basic react setup, routing, provider structure, basic styles and graphql queries.

## libs

### front-end

- `libs/computer`: Language runtime. Bridge between editor and language runtime.

### back-end

- `libs/backendtypes`: Typescript types for database access and graphql resolvers
- `libs/lambdas`: Individual lambda functions to be deployed to AWS
  - `src/auth-flow`: Authentication API (built on top of next-auth)
  - `src/http`: HTTP APIs implementation
  - `src/queues`: Lambdas that consume messages from queues
  - `src/ws`: Lambdas that react to server-side websocket events
- `libs/graphqlserver`: GraphQL server implementation, split into realms (pads, roles, users, etc.)
- `libs/graphqlresource`: Abstraction layer for generalizing queries and mutations over resources and their permissions.
- `backend-analytics`: help track events in the back-end
- `backend-trace`: wrapper for lambda handlers that tracks errors and back-end performance metrics into Sentry
- `dynamodb-lock`: a way to have serialized mutations to dynamodb tables.
- `emails`: the email templates we send
- `initial-workspace`: the notebooks that go into a freshly-created workspace.
- `node-lambda`: a patch over the architect sandbox that allows for lambda worker reuse and auto-reload.
- `services`: some abstraction over some infra-structure services like blobs, sending email, notebook content, managing permissions, managing users, workspaces, etc.
- `sync-connection-lambdas`: some more detailed implementation of the lambda functions for handling notebook sync over websockets.
- `tables`: wrapper around Architect's tables API, which enhances it and gives it some typescript types.
- `y-dynamodb`: back-end persistence Y.js plugin for notebook content sync.
- `y-lambdawebsocket`: back-end communication Y.js plugin for content sync.
- `config`: back-end configuration parameters (keys, timeouts, etc.)

### global

- `utils`: many goodies
- `language`
