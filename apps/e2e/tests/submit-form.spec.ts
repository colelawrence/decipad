/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import { expect, test } from './manager/decipad-tests';
import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'http';
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
  testUser,
}) => {
  const server = await startServer();
  const notebookURL = testUser.page.url();
  const webhookName = 'localhostWebhook';
  const weebookEmail = 'simao@n1n.co';
  const sliderName = 'TestSlider';
  const originalSliderValue = '5';
  const newSliderValue = '6';

  await test.step('adds submit form to a notebook', async () => {
    await createSliderBelow(testUser.page, sliderName, originalSliderValue);
    await testUser.notebook.addBlock('submit-form');

    await testUser.page.getByRole('button', { name: 'Send Submit' }).click();

    await expect(
      testUser.page.getByText('No secret selected').first(),
      'the submit form shows error message when used without webhook selected'
    ).toBeVisible();

    await testUser.page.getByTestId('add-webhook').click();

    await testUser.page.getByTestId('input-secret-name').fill(webhookName);
    await testUser.page
      .getByTestId('input-secret-value')
      .fill('http://localhost:4848/webhook');
    await testUser.page.getByTestId('add-secret-button').click();

    const newSecret = testUser.page.getByText(webhookName);
    await expect(newSecret).toBeVisible();

    await testUser.page.goto(notebookURL);
    await testUser.notebook.waitForEditorToLoad();

    await testUser.page
      .getByLabel('', { exact: true })
      .selectOption(webhookName);
  });

  await test.step('use submit form', async () => {
    await testUser.page.getByRole('button', { name: 'Send Submit' }).click();
    await expect(
      testUser.page.getByText('Email is required').first(),
      'the submit form shows error message when no email is added to the form before submit'
    ).toBeVisible();
    await testUser.page.getByPlaceholder('Email').fill(weebookEmail);
    await testUser.page.getByRole('button', { name: 'Send Submit' }).click();

    await expect(
      testUser.page.getByText('All done!'),
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
    await testUser.notebook.updateSlider(sliderName, newSliderValue);
    await testUser.page.getByTestId('close-submit-form').click();
    await testUser.page.getByPlaceholder('Email').fill(weebookEmail);
    await testUser.page.getByRole('button', { name: 'Send Submit' }).click();

    await expect(
      testUser.page.getByText('All done!'),
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
