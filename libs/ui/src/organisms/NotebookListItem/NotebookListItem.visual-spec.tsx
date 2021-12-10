import { render, waitFor } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';
import { ComponentProps } from 'react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { NotebookListItem } from './NotebookListItem';

const props: ComponentProps<typeof NotebookListItem> = {
  name: 'My Notebook',
  href: '/my-notebook',
};

describe('without a desciprtion', () => {
  test('the title occupies the combined space', async () => {
    const { getByText, rerender } = render(
      <NotebookListItem
        {...props}
        name="My Notebook"
        description="The Description"
      />
    );
    const { select, update } = await domToPlaywright(page, document);
    const { y: titleY } = (await (await page.$(
      select(getByText('My Notebook'))
    ))!.boundingBox())!;
    const { y: descriptionY } = (await (await page.$(
      select(getByText('The Description'))
    ))!.boundingBox())!;

    rerender(
      <NotebookListItem {...props} name="My Notebook" description={undefined} />
    );
    update(document);
    const { y: combinedY } = (await (await page.$(
      select(getByText('My Notebook'))
    ))!.boundingBox())!;

    expect(combinedY).toBeGreaterThanOrEqual(titleY);
    expect(combinedY).toBeLessThan(descriptionY);
  });
});

it('shows the actions menu button on hover', async () => {
  const { getByText, getByTitle } = render(
    <NotebookListItem {...props} name="My Notebook" />
  );
  const { select } = await domToPlaywright(page, document);

  expect(
    await page.$eval(
      select(findParentWithStyle(getByTitle(/actions/i), 'opacity')!.element),
      (button) => getComputedStyle(button).opacity
    )
  ).toBe('0');

  await page.hover(select(getByText('My Notebook')));
  await waitFor(async () => {
    expect(
      await page.$eval(
        select(findParentWithStyle(getByTitle(/actions/i), 'opacity')!.element),
        (button) => getComputedStyle(button).opacity
      )
    ).toBe('1');
  });
});

it('keeps showing the actions menu button when the menu is open', async () => {
  const { getByText, getByTitle } = render(
    <>
      <p>somewhere else</p>
      <NotebookListItem {...props} name="My Notebook" actionsOpen />
    </>
  );
  const { select } = await domToPlaywright(page, document);

  await page.hover(select(getByText('somewhere else')));
  expect(
    await page.$eval(
      select(findParentWithStyle(getByTitle(/actions/i), 'opacity')!.element),
      (button) => getComputedStyle(button).opacity
    )
  ).toBe('1');
});
