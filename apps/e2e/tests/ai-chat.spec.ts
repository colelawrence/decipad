import { expect, test } from './manager/decipad-tests';

test('AI adds variable block @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockAddVariable();
});

test('AI adds basic formula block @AI', async ({ testUser }) => {
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

test('AI adds slider @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockSliderWidget();
});

test('AI adds notebook paragraph @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockParagraph();
});

test('AI adds table to notebook @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockTable();
});

test('AI clear chat @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  const initialMessages = await aiAssistant.getChatMessages();
  await aiAssistant.mockAIChat();
  await aiAssistant.clearChat();

  await expect(async () => {
    await expect(await aiAssistant.getChatMessages()).toEqual(initialMessages);
  }, "chat didn't clear").toPass();
});
