# Decipad

All the things Deci.

## Preparation

For you to be able to run Deci locally, you need to have Node.js version 14.x installed.

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

### After Git or Github Desktop

## Install

After you're done with the preparation above, you can now choose a folder where you will install Deci. Normally people choose a folder named "dev" or "projects".

### Clone the decipad repo

If you're using the command line, you can install it like this:

```bash
git clone git@github.com:decipad/decipad.git
```

If you're using Github Desktop, clone the decipad repo (which installs it locally).

### Install dependencies.

Using the command line, inside your local copy of the decipad repo, you should do:

```bash
npm install --legacy-peer-deps
```

### Installing the nx cli

To be able to run our project, you should firstly install the nx cli globally on your machine. You can do this by running the following command in your command line:

```bash
npm install -g @nrwl/cli
```

### Running the project

To run the backend and the frontend, just copy and past the following command in your command line:

```bash
nx run-many --target=serve --projects=client,backend --parallel
```

### Testing the project

To run the unit tests for all the monorepos in the project, you can run the following:

```bash
nx run-many --target=test --all
```

### Running storybook

We use storybook for development and showcasing purposes of all of our components, you can also run storybook by running:

```bash
nx run ui:storybook
```

### Running the end-to-end tests

These tests are powered by cypress and are present in apps/client-e2e.

`cd` to the root of the repo, and run:

```bash
./scripts/e2e.sh
```

Interesting options are `--headless` (don't show a window) and `--watch` (don't close after running). They are forwarded to the script with a bash `$@`.

## Other stuff

To receive e-mails from the application (like when signing in through e-mail), verify your e-mail in SES (it's in sandbox mode so it only sends to verified e-mails)

    go to the aws web console
    search for SES service
    go there
    click on "Verified identities" in the menu
    Click on the button "Create identity"
    Choose "email address"
    Enter the email address you want your local dev env to send email to
    You will then receive a verification e-mail with more instructions

