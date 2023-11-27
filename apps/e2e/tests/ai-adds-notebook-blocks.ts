import { test } from './manager/decipad-tests';

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

test('AI transform variable on input widget @AI', async ({ testUser }) => {
  const { aiAssistant } = testUser;

  await aiAssistant.openPannel();
  await aiAssistant.mockInputWidget();
});

test('AI transform input widget on slider @AI', async ({ testUser }) => {
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
