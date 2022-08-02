import { render, waitFor } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';
import { ComponentProps } from 'react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { NotebookListItem } from './NotebookListItem';

const props: ComponentProps<typeof NotebookListItem> = {
  id: 'my-notebook',
  name: 'My Notebook',
  exportFileName: '',
  exportHref: '',
  icon: 'Rocket',
  iconColor: 'Catskill',
};

it('shows the actions menu button on hover', async () => {
  const { getByText, getByTitle } = render(
    <NotebookListItem {...props} name="My Notebook" />
  );
  const { select } = await domToPlaywright(page, document);

  expect(
    await page.$eval(
      select(findParentWithStyle(getByTitle(/ellipsis/i), 'opacity')!.element),
      (button) => getComputedStyle(button).opacity
    )
  ).toBe('0');

  await page.hover(select(getByText('My Notebook')));
  await waitFor(async () => {
    expect(
      await page.$eval(
        select(
          findParentWithStyle(getByTitle(/ellipsis/i), 'opacity')!.element
        ),
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
      select(findParentWithStyle(getByTitle(/ellipsis/i), 'opacity')!.element),
      (button) => getComputedStyle(button).opacity
    )
  ).toBe('1');
});
