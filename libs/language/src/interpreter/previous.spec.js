import { mapWithPrevious } from './previous';
import { Realm } from './Realm';

it('mapWithPrevious', async () => {
  const rows = [1, 2, 4];
  const foundPrevious = [];

  const realm = new Realm();

  const rollySum = await mapWithPrevious(realm, async function* () {
    for (const row of rows) {
      foundPrevious.push(realm.previousValue);
      yield realm.previousValue + row;
    }
  });

  expect(realm.previousValue).toEqual(null);
  expect(rollySum).toMatchInlineSnapshot(`
    Array [
      1,
      3,
      7,
    ]
  `);
  expect(foundPrevious).toMatchInlineSnapshot(`
    Array [
      null,
      1,
      3,
    ]
  `);
});
