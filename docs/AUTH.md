# Authentication and Authorization

## Authentication

Even though we don't use next, we use [`next-auth`](https://next-auth.js.org) for authentication.

This code for authentication is contained in the [`libs/lambdas/src/auth-flow`](../libs/lambdas/src/auth-flow/).

## JWT

For authentication tokens we use [JWT](https://jwt.io/), which is not only consumed in the `/api/session` end-point, but also on our GraphQL server implementation by injecting the user into the GraphQL context (see [`libs/graphqlserver/src/context.ts`](../libs/graphqlserver/src/context.ts)).

## Authorization

For authorization we use both role-based and user-based access control, which is based on the `permissions` table, which contains all the role and user permissions to any resource (workspace, pad (now known as "notebook"), etc.).

Each permission has a permission type, which can be one of the following:

- `undefined` or `void`: cannot read the resource (it's the abscense of any type of permission)
- `READ`: can read the resource
- `WRITE`: can write to the resource and all of the above
- `ADMIN`: can do all of the above plus manage the permissions on the resource
