# Cheat sheet

```bash
jest path/to/test # runs a test
jest path/to/test --watch # watch the test continuously running

jest apps/client-e2e/src/pad-markdown.ts # runs a test in the browser (headless)
PWDEBUG=1 jest apps/client-e2e/src/pad-markdown.ts # runs a test in the browser (headed) pause execution with await page.pause();
 npx playwright codegen https://dev.decipad.com # try out playwright and get some selectors and code for tests

nx test language # tests the language
nx lint language --fix # lints the language
nx typecheck language # typechecks the language
nx serve docs # See the docs
```

Available nx things: `editor` `ui` `language` `client` `backend` `storybook` `docs` `editor-plugins`

I have no idea how it works, trial and error really.

```bash
yarn serve:docs # see the docs
yarn serve:all # runs the client and the backend
yarn install # install deps, needed often when new stuff is added

npm run build:grammar # builds the grammar
yarn repl # runs the repl, for easy debugging without browser (you can attach the inspector)

nx play e2e [--debug] [--ui] # Run e2e tests
nx run ui:storybook # See the design system (storybook)
nx test sync-connection-lambdas
```

On the browser console

```js
localStorage.deciAllowDarkTheme = true; // to turn dark mode on
localStorage.deciPopulatePlayground = true; // to render a document when in the playground.
```
