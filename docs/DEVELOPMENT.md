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

You can decide to close a pull-request without merging. You'll need to clean up some resources, though. Read on.

## Cleaning up a pull-request after closing or merging

When you close or merge a pull-request, a Github action to remove the PR env (this PR env corresponds to a AWS Cloudformation stack). This github action fails most of the times because AWS Cloudformation sometimes fails at removing some of the resources associated with a stack.

If this happens (and you should get a notification from Github when it does), please do the following:

- Go to the web AWS console and log in.
- Go to Cloudformation
- From the list of stacks, detect the stack that corresponds to the PR number in question.
- Try to remove that stack. That should send that stack into the `DELETE_IN_PROGRESS` state.
- Check back in a while. If the stack no longer appears on the stack list, you're done.
- If the stack still exists, it should now be in the `DELETE_FAILED` state.
- Try removing it again, but this time take attention to the dialog box that AWS shows you. This dialog box lists the resources that Cloudformation wasn't able to remove. If that list consists **only** of an S3 static bucket, do the following:
  - Copy the name of the bucket (something like `decipadbackendstaging1073-staticbucket-pylqowlhk6n0`)
  - In the Cloudformation remove stack dialogue box (that lists the resources to retain), select the S3 static bucket to be retained and retry removing.
  - In the local console, run `./scripts/aws-s3-remove-bucklet.sh <bucket>`.
- If, on the other hand, there are more resources that failed removing, don't retain any resources and try removing again. Repeat until either succeeds or only one S3 bucket is there, and go to the previous point.

The final state should be:

- Cloudformation stack removed without leaking resources
- S3 bucket removed

## Resources

- [Cheat sheet](CHEAT_SHEET.md)
