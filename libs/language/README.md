# language

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test language` to execute the unit tests via [Jest](https://jestjs.io).


## Structure

The most complex folders are:

 - src/grammar -> [nearley](https://www.npmjs.com/package/nearley) grammar files (rebuilt with `npm run build:grammar`)
 - src/parser -> wraps the grammar in order to parse stuff. Also contains the parser tests
 - src/infer -> typechecks things
 - src/interpreter -> evaluates things
 - src/computer contains a computer capable of computing only what's changed

The other folders are for supporting code

 - src/builtins contains the builtin functions
 - src/type contains the Type structure which represents a possibly nested data type
 - src/dimtools contains helpers to traverse units automatically
 - src/date contains the date management stuff