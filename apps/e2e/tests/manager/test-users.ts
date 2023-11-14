import { type Locator, type Page, Browser } from '@playwright/test';
import { app, auth } from '@decipad/backend-config';
import { Notebook } from './notebook';
import { Workspace } from './workspace';
import stringify from 'json-stringify-safe';

function randomNumber(max = 100000) {
  return Math.round(Math.random() * max);
}

export function randomEmail(): string {
  return `T${randomNumber()}-${Date.now()}@decipad.com`;
}

export function premiumEmail(): string {
  return `T${randomNumber()}-${Date.now()}@n1n.co`;
}

export function genericTestEmail(): string {
  return `generic-test-user@decipad.com`;
}

export class User {
  page: Page;
  email: string;
  newNotebook: Locator;
  public notebook: Notebook;
  public workspace: Workspace;

  constructor(page: Page) {
    this.page = page;
    this.email = 'generic-test-user@decipad.com';
    this.notebook = new Notebook(this.page);
    this.newNotebook = this.page.getByTestId('new-notebook');
    this.workspace = new Workspace(this.page);
  }

  async goToWorkspace() {
    await this.page.goto('/');
    await this.page.waitForURL(/\/w\/(.+)/);
    const workspaceID = this.page.url().match(/\/w\/(.+)/);
    if (workspaceID) {
      this.workspace.updateDefaultWorkspaceID(workspaceID[1].toString());
    }
  }

  async setupFree() {
    await this.goToWorkspace();
  }

  async setupWithEmail(email: string) {
    this.email = email;
    const loginUrl = `${app().urlBase}/api/auth/${
      auth().testUserSecret
    }?email=${encodeURIComponent(email)}`;
    await this.page.goto(loginUrl);
  }

  async setupRandomFreeUser(email: string = randomEmail()) {
    await this.setupWithEmail(email);
  }

  async setupRandomPremiumUser(email: string = premiumEmail()) {
    await this.setupWithEmail(email);
  }

  /**
   *Creates and navigates to a new notebook.
   *
   * **Usage**
   *
   * ```js
   * await testUser.createAndNavNewNotebook();
   * ```
   */
  // todo: move this to workspace pom
  async createAndNavNewNotebook() {
    await this.goToWorkspace();
    await this.newNotebook.click();
    await this.page.waitForSelector('[data-slate-editor] h1');
  }

  async navigateToNotebook(notebookId: string) {
    await this.page.goto(`/n/pad-title:${notebookId}`);
  }

  async importNotebook(
    source: object,
    workspaceId: string = this.workspace.baseWorkspaceID
  ) {
    const sourceString = Buffer.from(stringify(source), 'utf-8').toString(
      'base64'
    );
    const req = {
      data: stringify({
        query:
          'mutation ImportNotebook($workspaceId: ID!, $sourceString: String!) {\n' +
          '  importPad(workspaceId: $workspaceId, source: $sourceString) {\n' +
          '    id\n' +
          '  }\n' +
          '}\n',
        operationName: 'ImportNotebook',
        variables: { workspaceId, sourceString },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const resp = await (await this.page.request.post('/graphql', req)).json();
    if (resp.errors?.length) {
      throw new Error(resp.errors[0].message);
    }
    const notebookId = resp.data.importPad.id;
    await this.navigateToNotebook(notebookId);
    await this.notebook.waitForEditorToLoad();
    return notebookId;
  }

  /*
   * Open new browser with new user.
   *
   * **Usage**
   * ```js
   * const { page: testUserPage, notebook: testUserNotebook } = await randomFreeUser.new();
   * ```
   */

  async new(browser: Browser, email: string = randomEmail()) {
    const context = await browser.newContext();
    const userPage = new User(await context.newPage());
    await userPage.setupWithEmail(email);
    return userPage;
  }
}
