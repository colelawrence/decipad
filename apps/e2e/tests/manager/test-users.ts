import { type Locator, type Page, Browser, expect } from '@playwright/test';
import { app, auth } from '@decipad/backend-config';
import { Notebook } from './notebook';
import { Workspace } from './workspace';
import { AiAssistant } from './ai-assistant';
import stringify from 'json-stringify-safe';
import arc from '@architect/functions';

function randomNumber(max = 100000) {
  return Math.round(Math.random() * max);
}

export function randomEmail(): string {
  return `T${randomNumber()}-${Date.now()}@decipad.com`.toLowerCase();
}

export function premiumEmail(): string {
  return `T${randomNumber()}-${Date.now()}@n1n.co`.toLowerCase();
}

export function genericTestEmail(): string {
  return `generic-test-user@decipad.com`.toLowerCase();
}

export class User {
  page: Page;
  email: string;
  newNotebook: Locator;
  public notebook: Notebook;
  public workspace: Workspace;
  public aiAssistant: AiAssistant;

  constructor(page: Page) {
    this.page = page;
    this.email = 'generic-test-user@decipad.com';
    this.notebook = new Notebook(this.page);
    this.newNotebook = this.page.getByTestId('new-notebook');
    this.workspace = new Workspace(this.page);
    this.aiAssistant = new AiAssistant(this.page);
  }

  async goToWorkspace(workspaceIdOverride: string | null = null) {
    if (workspaceIdOverride) {
      await this.page.goto(`/w/${workspaceIdOverride}`);
    } else {
      await this.page.goto('/');
    }
    await this.page.waitForURL(/\/w\/(.+)/);
    const workspaceID = this.page.url().match(/\/w\/(.+)/);
    if (workspaceID) {
      await this.workspace.updateDefaultWorkspaceID(workspaceID[1].toString());
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
  async createAndNavNewNotebook(workspaceId?: string) {
    await this.goToWorkspace(workspaceId);
    await this.newNotebook.waitFor();
    await this.newNotebook.click();
    await this.aiAssistant.closePannel();
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

  /**
   * Click Try Decipad and create account
   *
   * **Usage**
   *
   * ```js
   * await tryDecipadCreateAccount();
   * ```
   */
  async tryDecipadCreateAccount() {
    this.email = randomEmail();
    await this.page.getByRole('link', { name: 'Try Decipad' }).click();

    const parseRedirect = this.page
      .url()
      .match(/http:\/\/localhost:3000\/w\?redirectAfterLogin=(.*)/);
    const redirect = parseRedirect ? parseRedirect[1] : '';

    await this.page.getByPlaceholder('Enter your email').fill(this.email);
    await this.page.getByTestId('login-button').click();

    await expect(
      this.page.getByText(
        `Open the link sent to ${this.email}. No email? Check spam folder.`
      )
    ).toBeVisible();

    let authLink = '';
    await expect(async () => {
      const data = await arc.tables();
      const verificationRequests = (
        await data.verificationrequests.query({
          IndexName: 'byIdentifier',
          KeyConditionExpression: 'identifier = :email',
          ExpressionAttributeValues: {
            ':email': this.email,
          },
        })
      ).Items;

      expect(verificationRequests).toHaveLength(1);
      const [verificationRequest] = verificationRequests;
      expect(verificationRequest).toMatchObject({
        id: expect.any(String),
        identifier: this.email,
        openTokenForTestsOnly: expect.any(String),
        expires: expect.any(Number),
        token: expect.any(String),
      });
      authLink = `${app().urlBase}/api/auth/callback/email?callbackUrl=${
        app().urlBase
      }${redirect}&token=${encodeURIComponent(
        verificationRequest.openTokenForTestsOnly ?? ''
      )}&email=${encodeURIComponent(this.email)}`;
      expect(authLink).toBeDefined();
    }).toPass();

    await this.page.goto(authLink!);
    await expect(this.page.getByTestId('duplicate-button')).toBeVisible();
  }

  /**
   * Add values to the clipboard in the current browser
   * @param values map from mime type to to value
   *
   * **Usage**
   * ```js
   * await testUser.writeToClipboard({
   *  'text/plain': 'Hello World',
   *  'text/html': '<b>Hello World</b>'
   * });
   * ```
   */
  async writeToClipboard(values: { [key: string]: string }) {
    this.page.evaluate(async (clipboard) => {
      for (const type in clipboard) {
        if (type) {
          navigator.clipboard.write([
            new ClipboardItem({
              [type]: new Blob([clipboard[type]], { type }),
            }),
          ]);
        }
      }
    }, values);
  }
}
