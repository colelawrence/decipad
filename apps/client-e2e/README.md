# client-e2e

This contains the end-to-end tests for the client (duh!)

The tests use [playwright](https://playwright.dev/) and [jest-playwright](https://github.com/playwright-community/jest-playwright)

## Structure

The tests are structured like regular ol' jest tests.

## Relevant env vars:

- `TEST_BASE_URL` (default: `http://localhost:3000`)

## Run them tests

`nx e2e client-e2e` (assumes frontend and backend are up!)
