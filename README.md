<p align="center">
  <img src="https://user-images.githubusercontent.com/12210180/162798827-fd60eab3-907c-4ca1-a0dc-12ef34acb518.png" width="50">
</p>

<h2 align="center">Decipad — Make sense of numbers</h2>

> All the things Deci.

# TOC

- [Setup](#set-up)
- [Development cycle](docs/DEVELOPMENT.md)

## Set up

For you to be able to run Deci locally, you need to have Node.js version 16.x installed.

If you don't already, you can go to [the Node.js official website](https://nodejs.org/en/) to download and run the installer.

After that you will need a Github account. If you don't already have one, you can [signup for one here](https://github.com/join), and then ask someone in the dev team to add you to the team.

Now you have to choose one of two paths:

\1. You install git and use the command-line.

or

\2. You install [Github Desktop (which has a nice GUI)](https://desktop.github.com).

### Git and command-line

(Skip this part if you're using Github Desktop).

You will need to have [git](https://git-scm.com) installed on your computer. If you don't already have it, you can [download it and install it form the official website](https://git-scm.com/download).

You will also need to run stuff on the command line. Depending on your system (Windows, Mac, or Linux), you will have different solutions for this. Ask the dev team if you're not sure what to do here.

## Install

After you're done with the preparation above, you can now choose a folder where you will install Deci. Normally people choose a folder named "dev" or "projects".

### Clone the decipad repo

If you're using the command line, you can install it like this:

```bash
git clone git@github.com:decipad/decipad.git
```

If you're using Github Desktop, clone the decipad repo (which installs it locally).

### Install dependencies

We use `yarn` to manage package instalation. If you don't have `yarn` available to your command line, you can install it globally by using:

```bash
npm install yarn -g
```

Using the command line, inside your local copy of the decipad repo, you should do:

```bash
yarn install
```

After dependency upgrades, some existing compilation caches can cause problems. To clean them, you might need to run:

```bash
yarn clean:all
```

### (Optional) Git hooks

If you'd like to set up lint and test running before commit, run `yarn husky install`.
Note that the hooks may behave differently than CI. CI is the authoritative source for lint and test verification.

## AWS local setup

For you to be able to develop you will need access to a Deci development AWS user account.

Also, you'll need to install the AWS CLI. Once you have done that, you'll need to generate an access key, which you'll need to introduce when running:

```sh
aws configure
```

If asked for a _AWS region_, use `eu-west-2`.

## Newer MacOS port setup

In newer MacOS versions (starting from Monterey) Apple runs it’s Airplay Receiver on Port 5000. This directly conflicts with architect running on Port 5000.

To solve this simply run or add `export ARC_TABLES_PORT=6000`to your .bashrc, .zshrc or equivalent script.

## Environment setup

There are `.env.example` files in the root and in individual projects like the `backend`. These need to be copied to `.env` (without `.example`) and filled with secret values, such as your personal AWS access token, or other secrets that are shared among developers but not included in the repository for security reasons.

## Important scripts

### Nx CLI

The project is currently maintained by the nx cli, the nx cli is the one to use to test, lint, format and run libraries and apps across the project, here are some of the most common nx cli commands you could use in the project:

`nx test <lib>` # Runs jest on a library or an app.

`nx test <lib> --testFile=<filename.ts>` # Runs jest test on a specific file in a specific library or an application.

`nx test <lib> --watch` # Runs jest on a library or an application in watch mode.

`nx lint <lib>` # Runs the linter on an app or a library.

`nx typecheck <lib>` # Runs typescript check on an app or library.

You can even use the nx cli to generate libraries, apps, react components, stories and much more. [Check out nx docs](https://nx.dev/l/r/getting-started/nx-cli)

### Running the project

To run the backend and the frontend, just copy and past the following command in your command line:

```bash
yarn serve:all
```

### Testing the project

To run the unit tests for all the monorepos in the project, you can run the following:

```bash
yarn test
```

### Running storybook

We use storybook for development and showcasing purposes of all of our components, you can also run storybook by running:

```bash
yarn serve:storybook
```

### Running docs

We document Deci by using [Docusaurus](https://docusaurus.io) in [the `apps/docs` folder](apps/docs).

You can start the docs server by running:

```bash
yarn serve:docs
```

To contribute with changes, you can edit the documents at [the apps/docs/docs folder](apps/docs/docs).

### Running the end-to-end tests

These tests are powered by playwright and are present in apps/client-e2e.

`cd` to the root of the repo, and run:

```bash
yarn e2e
```

### Running individual e2e tests

**Important:** use npx and cd to e2e folder before running the command.

`cd` to the `apps/e2e` folder, and run:

```bash
npx playwright test <<test-name-pattern>>  [--debug]
```

> To run the E2E tests individually you will need the local sandbox server running (which you can start with `yarn serve:all` on a different terminal).

Interesting options are `--headless` (don't show a window) and `--watch` (don't close after running).

## Private deploys and fast client updates

You can deploy your own private instance by following these instructions:

https://www.loom.com/share/a0b33c1071d343fb8a216ef64ad217ea

## Developing new or changing GraphQL queries

Sometimes you may neeed to develop a feature from end to end, or you may want to change or add a Graphql interface. If that's the case, here is what you need to know and do:

The GraphQL API is divided up into separate realms in [`libs/graphqlserver`](libs/graphqlserver). This is mainly to keep things organized, as it's all put together at compile and run time.

You'll need to search and spot the realm you want to add or change something. If there's no suited realm, you can create one. (If you do, don't forget to add it to `libs/graphqlserver/src/modules.ts`).

Then you will need to change or add the typedef with the GraphQL interface and the implement or change the resolvers for that interface.

You should have a server up and running, so that you can manually test your GraphQL server. To do that, you can run:

`yarn serve:all`

or, if you prefer to run things in separate terminal windows, in two separate terminal windows:

```bash
nx serve backend
nx serve client
```

(The `nx serve backend` runs everything you should need in the backend for you: database, queues and respective lambdas, graphQL server, HTTP lambdas and websockets).

Then, you can then head out to your local GraphQL playground ([http://localhost:3000/graphql](http://localhost:3000/graphql)) and test your endpoint manually.

### Adding tests

When changing the Graphql API, you should always add or change the integration tests.

To run all the back-end tests you can run:

```bash
nx test backend
```

But if you need to test a specific file you can do:

```bash
jest apps/backend/tests/<file>.spec.ts --testTimeout=10000
```

Alternatively, you can watch the file for changes and run the test every time there is a change:

```bash
jest apps/backend/tests/<file>.spec.ts --testTimeout=10000 --watch
```

### Generating your GraqphQL client stuffs

If you're also doing client-side stuff that depends on the changes, you will need to run the following commands:

```bash
yarn build:graphql
```

This command will build a schema file from your local server schema.

Then you'll need to generate the client-side typescript files:

```bash
yarn build:graphql:queries
```

This will generate files in `libs/queries`.

If you need to add or change a query, you need to add or change a file in `libs/queries/src/lib/operations/{mutations,queries}` (depending on whether it's a mutation or a query).

If you add or change a file in `libs/queries/src/lib`, you'll need to re-run the `yarn build:graphql:queries` command to (re)generate the Typescript files.

If you're adding a file to You may also need to `libs/queries/src/lib/operations/{mutations,queries}`, you'll also need to export it in `libs/queries/src/lib/index.ts`, so that the client code may use it.

## Further resources

- [Development cycle](docs/DEVELOPMENT.md)
- [Cheat sheet](docs/CHEAT_SHEET.md)

### Documentation for certain areas of the codebase

Some packages (both `apps` and `libs`) and sometimes even subdirectories may contain their own `README` files documenting peculiarities or other noteworthy things about the package or directory contents. Make sure to read them before working extensively in one area.

There is also documentation available for larger areas of the codebase that span more than one package:

- [Frontend](docs/FRONTEND.md)
