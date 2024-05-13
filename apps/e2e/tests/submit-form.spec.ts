/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import { expect, test } from './manager/decipad-tests';
import express from 'express';
import bodyParser from 'body-parser';
import type { Server } from 'http';
import { createSliderBelow } from '../utils/page/Block';
import util from 'util';

interface Payload {
  data: {
    SimpleSlider: {
      id: string;
      result: {
        type: string;
        value: number;
        unit: null;
      };
    };
  };
  email: string;
}

let lastPayload: Payload | null = null;

async function startServer(): Promise<Server> {
  const app = express();
  const port = 4848;

  app.use((req, res, next) => {
    if (req.headers['content-type'] === 'text/plain;charset=UTF-8') {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          req.body = JSON.parse(data);
          next();
        } catch (error) {
          console.error('Error parsing text/plain payload as JSON:', error);
          res.status(400).send('Invalid JSON');
        }
      });
    } else {
      next();
    }
  });

  app.use(bodyParser.json());

  app.post('/webhook', (req, res) => {
    lastPayload = req.body;
    console.log(
      'Received webhook payload:',
      util.inspect(req.body, {
        showHidden: false,
        depth: null,
        colors: true,
      })
    );
    res.sendStatus(200);
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function stopServer(server: Server) {
  return new Promise<void>((resolve) => {
    server.close(() => {
      console.log('Server stopped');
      resolve();
    });
  });
}
test('redirect to workspace if authenticated and can logout @forms', async ({
  randomFreeUser,
}) => {
  const { page, notebook, workspace } = randomFreeUser;
  const server = await startServer();
  const webhookName = 'localhostWebhook';
  const weebookEmail = 'simao@n1n.co';
  const sliderName = 'TestSlider';
  const originalSliderValue = '5';
  const newSliderValue = '6';

  await workspace.newWorkspaceWithPlan('plus');
  await workspace.createNewNotebook();
  await randomFreeUser.aiAssistant.closePannel();
  await notebook.waitForEditorToLoad();
  await notebook.focusOnBody();
  const notebookURL = page.url();

  await test.step('adds submit form to a notebook', async () => {
    await createSliderBelow(page, sliderName, originalSliderValue);
    await notebook.addBlock('submit-form');

    await page.getByRole('button', { name: 'Send Submit' }).click();

    await expect(
      page.getByText('No secret selected').first(),
      'the submit form shows error message when used without webhook selected'
    ).toBeVisible();

    await page.getByTestId('add-webhook').click();

    await page.getByTestId('input-secret-name').fill(webhookName);
    await page
      .getByTestId('input-secret-value')
      .fill('http://localhost:4848/webhook');
    await page.getByTestId('add-secret-button').click();

    const newSecret = page.getByText(webhookName);
    await expect(newSecret).toBeVisible();

    await page.goto(notebookURL);
    await notebook.waitForEditorToLoad();

    await page.getByLabel('', { exact: true }).selectOption(webhookName);
  });

  await test.step('use submit form', async () => {
    await page.getByRole('button', { name: 'Send Submit' }).click();
    await expect(
      page.getByText('Email is required').first(),
      'the submit form shows error message when no email is added to the form before submit'
    ).toBeVisible();
    await page.getByPlaceholder('Email').fill(weebookEmail);
    await page.getByRole('button', { name: 'Send Submit' }).click();

    await expect(
      page.getByText('All done!'),
      'the submit form never displayed the success message'
    ).toBeVisible();

    const expectedPayload = {
      data: {
        [sliderName]: {
          id: expect.any(String),
          result: {
            type: 'number',
            value: parseInt(originalSliderValue, 10),
            unit: null,
          },
        },
      },
      email: weebookEmail,
    };

    expect(lastPayload).toMatchObject(expectedPayload);
  });

  await test.step('update slider and check form sends new value', async () => {
    await notebook.updateSlider(sliderName, newSliderValue);
    await page.getByTestId('close-submit-form').click();
    await page.getByPlaceholder('Email').fill(weebookEmail);
    await page.getByRole('button', { name: 'Send Submit' }).click();

    await expect(
      page.getByText('All done!'),
      'the submit form never displayed the success message'
    ).toBeVisible();

    const expectedPayloadAfterSliderUpdate = {
      data: {
        [sliderName]: {
          id: expect.any(String),
          result: {
            type: 'number',
            value: parseInt(newSliderValue, 10),
            unit: null,
          },
        },
      },
      email: weebookEmail,
    };

    expect(lastPayload).toMatchObject(expectedPayloadAfterSliderUpdate);
  });
  await stopServer(server);
});
