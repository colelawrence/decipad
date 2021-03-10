# Decipad

> This repository will host all the packages for Deci, it is a monorepo using yarn and lerna. It is sharing a common eslint and prettier config files between all packages so that code stays consistent.

## Getting started

You should firstly make sure that lerna and yarn are both installed globally on your machine, you can check that by running the following commands:

```bash
# Example: 1.22.4
$ yarn --version

# Example: 3.22.1
$ lerna --version
```

After you have cloned the repository into your machine and cd into the root directory, you should install all the dependencies so that you can run the packages, you can do that by running the command `lerna bootstrap`.

## Adding dependencies in packages

there are two ways of adding dependencies in a package, the first one is to cd into the package and just `yarn add` there, this is fine for npm packages but will not work with the monorepo's packages. To install monorepo packages you can run the following command in the root directory of the repository.

```bash
lerna add @decipad/<package-name> --scope=@decipad/<where-to-install-the-package>
```

## Running the repository

If you want to run the same npm script on all packages, you can just run `lerna run <script-name> --stream --parallel`

If you want to run the npm script on only one or a set of packages, you can do the following:

```bash
lerna run <script-name> --stream --scope=@decipad/<package-name>
```

or let's say you want to run the dev command in both the app and landing packages only:

```bash
lerna run dev --stream --scope=@decipad/{landing,app}
```

**note:** you can't have spaces after the "," otherwise it will error out.

## More info

You can read more about both lerna and yarn workspaces here:

[Lerna](https://github.com/lerna/lerna)
[Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)

## One more thing

When in doubt, `lerna clean && lerna bootstrap`
