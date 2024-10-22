/* eslint-disable playwright/no-skipped-test */
import { expect, test } from './manager/decipad-tests';
import { snapshot } from '../utils/src';

// TODO: we skip these tests because apparenly we can't mock websockets using playwright.
test('snapshot test for AI panel', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await snapshot(testUser.page, 'AI Chat', {
    mobile: false,
  });
});

test.skip('AI adds variable block @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockAddVariable();
});

test.skip('AI adds basic formula block @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockAddFormula();
});

// eslint-disable-next-line playwright/no-skipped-test
test.skip('AI adds input widget @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockInputWidget();
});

test.skip('AI adds slider @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockSliderWidget();
});

test.skip('AI adds notebook paragraph @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockParagraph();
});

test.skip('AI adds table to notebook @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockTable();
});

test.skip('AI clear chat @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  const initialMessages = await aiAssistant.getChatMessages();
  await aiAssistant.mockAIChat();
  await aiAssistant.clearChat();

  await expect(async () => {
    expect(await aiAssistant.getChatMessages()).toEqual(initialMessages);
  }, "chat didn't clear").toPass();
});
