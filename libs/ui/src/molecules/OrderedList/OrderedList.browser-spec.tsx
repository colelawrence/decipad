import { render } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';
import { OrderedList } from './OrderedList';

it('numbers the list items', async () => {
  const { getByText } = render(
    <OrderedList>
      <div>Item 1</div>
      <div>Item 2</div>
    </OrderedList>
  );
  const { select } = await domToPlaywright(page, document);

  const listItem = await page.waitForSelector(
    select(getByText('Item 2').closest('li')!),
    { state: 'attached' }
  );
  const { content } = await listItem.evaluate((elem) =>
    getComputedStyle(elem, '::before')
  );
  expect(content).toMatchInlineSnapshot(`"counter(list-item) \\".\\""`);
});

it('aligns the list items', async () => {
  const { getByText } = render(
    <OrderedList>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
      <div>Item 4</div>
      <div>Item 5</div>
      <div>Item 6</div>
      <div>Item 7</div>
      <div>Item 8</div>
      <div>Item 9</div>
      <div>Item 10</div>
    </OrderedList>
  );
  const { select } = await domToPlaywright(page, document);

  const item1 = await page.waitForSelector(select(getByText('Item 1')));
  const item10 = await page.waitForSelector(select(getByText('Item 10')));

  expect((await item10.boundingBox())!.x).toEqual(
    (await item1.boundingBox())!.x
  );
});
