import { focusOnBody, setUp, waitForEditorToLoad } from './page-utils/Pad';

describe('notebook starter checklist', () => {
  beforeAll(() =>
    setUp({
      showChecklist: true,
    })
  );
  beforeAll(async () =>
    waitForEditorToLoad(page, {
      showChecklist: true,
    })
  );

  it('shows the checklist', async () => {
    const checklist = page.locator('text=👋 Welcome to Decipad!');
    expect(await checklist.count()).toBe(1);
  });

  it('checks off the create calculation goal', async () => {
    await focusOnBody();
    // not using createCodeLineBelow() because this is most likely how the user
    // would create a calculation line.
    await page.keyboard.type('/');
    await page.locator('text=Calculations').click();
    await page.waitForTimeout(200);

    const goal = await page
      .locator('text=Create your first calculation')
      .evaluate((e) =>
        window.getComputedStyle(e).getPropertyValue('text-decoration')
      );

    expect(/line-through/i.test(goal)).toBeTruthy();
  });
  it('gets the edit calculation goal', async () => {
    await page.keyboard.type('InMyPocket = TotalWinnings - 24%');
    const changeCalculationGoal = page.locator('text=Edit the calculation');

    // Race condition for the css to be applied properly.
    await page.waitForTimeout(200);
    const goal = await changeCalculationGoal.evaluate((e) =>
      window.getComputedStyle(e).getPropertyValue('text-decoration')
    );

    expect(/line-through/i.test(goal)).toBeTruthy();
  });
  it('gets the edit calculation goal (edit an input widget)', async () => {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('/input');
    await page.locator('svg:has(title:has-text("Input"))').click();

    await page.locator('[aria-placeholder="1 km"]').click();
    await page.keyboard.type('100');
    await page.waitForTimeout(200);

    const editVarGoal = page.locator('text=Create your first input variable');

    const goal = await editVarGoal.evaluate((e) =>
      window.getComputedStyle(e).getPropertyValue('text-decoration')
    );
    expect(/line-through/i.test(goal)).toBeTruthy();
  });
});
