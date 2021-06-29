# Decipad

> All the things Deci.

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

## Important scripts

### Running the project

To run the backend and the frontend, just copy and past the following command in your command line:

```bash
npm run serve:all
```

### Testing the project

To run the unit tests for all the monorepos in the project, you can run the following:

```bash
npm test
```

### Running storybook

We use storybook for development and showcasing purposes of all of our components, you can also run storybook by running:

```bash
npm run nx run ui:storybook
```

### Running the end-to-end tests

These tests are powered by cypress and are present in apps/client-e2e.

`cd` to the root of the repo, and run:

```bash
./scripts/e2e.sh
```

Interesting options are `--headless` (don't show a window) and `--watch` (don't close after running).

## Environment setup

There are `.env.example` files in the root and in individual projects like the `backend`. These need to be copied to `.env` (without `.example`) and filled with secret values, such as your personal AWS access token, or other secrets that are shared among developers but not included in the repository for security reasons.

### Amazon SES emails

To receive e-mails from the application (like when signing in through e-mail), verify your e-mail in SES (it's in sandbox mode so it only sends to verified e-mails)

* Go to the AWS web console
* Search for the SES service and go there
* If you are offered to switch to "Use the new console" in the menu (and thus are on the "classic console"), do it
* Click "Verified identities" in the menu
* Click on the button "Create identity"
* Choose identity type "Email address"
* Enter the email address you want to send email to
* Confirm by clicking "Create identity"
* You will then receive a verification e-mail with instructions to complete the confirmation

## Private deploys and fast client updates

You can deploy your own private instance by following these instructions:

https://www.loom.com/share/a0b33c1071d343fb8a216ef64ad217ea

## Sub-package documentation

- [runtime](libs/runtime/README.md)
