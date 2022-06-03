# Development cycle

## Local development

All development is made on a local environment. For each type of work there are a few tools you need to be running.

### Docs

To edit the docs you should start a doc server like this:

```bash
nx serve docs
```

Once the server starts your browser should open the local copy of the docs.
Make changes to the documents and folders in `apps/docs/docs`.
Any changes should be auto-loaded into your browser window.

### Front-end

To launch all the services you need to run:

```bash
yarn serve:all
```

The front-end website will be accessible in [http://localhost:4200](http://localhost:4200).

### Back-end

If you're doing back-end-only work, you don't need to open the front-end.
Instead, you should add and change the automated tests in `apps/backend/tests` and run those tests on every change (use the `--watch` jest flag to rerun automatically).

Each time you make a change to the back-end, you need to build the back-end assets:

```bash
yarn build:backend
```

To build on every change, you can instead use:

```bash
yarn build:backend:watch
```

## Branches

To create a feature, fix a bug or any type of change to the source code, you'll need to work on a dedicated branch. Follow these steps to start:

1. Before creating a branch, you need to make sure you have the latest version of the `main` branch:

```bash
git checkout main
git pull
```

2. Next, you need to make sure you have a ticket on Linear. In each ticket there's a branch name. Get that name and create a local branch with it:

```bash
git checkout -b <branch>
```

3. After committing all the changes to the code, you'll need to push it to the remote branch:

```
git push --set-upstream origin <branch>
```

(This is for the first time. For subsequent pushes you'll only need to `git push`).

## Pull-request

Once you're satisfied with the code you'll need to

- Head to Github and create a pull-request (PR) from that branch into `main`.
- Wait until the tests and deploys pass. If they don't pass fix them locally and then push the changes.
- Assign reviewers to your pull-request. A pull-request should be reviewed by at least one person that is familiar with that part of the code.
- If the deploy process of that pull-request runs successfully, you should get a notification (on Discord) with a link of a replica of the application running (we call this a "PR env"). You can use this to test it yourself or ask others to test.
- Once any of the reviewers give some feedback, you can reply and / or make changes to the code and push them.
- Once everyone involved is satisfied with the code, you can merge it. Merge using the "Squash merge" button, so that it creates one and only one commit on the `main` branch.

## Aborting a pull-request

You can decide to close a pull-request without merging.

## Resources

- [Cheat sheet](CHEAT_SHEET.md)
