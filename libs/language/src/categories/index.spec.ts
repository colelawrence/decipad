// eslint-disable-next-line no-restricted-imports
import { Value, buildType as t } from '@decipad/language-types';
import { col, categories } from '../utils';
import { inferCategories } from '.';
import { Realm } from '../interpreter';
import type { Context } from '..';
import { makeContext } from '..';

let testRealm: Realm;
let testContext: Context;
beforeEach(() => {
  testContext = makeContext({
    initialGlobalScope: {
      City: t.column(t.string(), 'City'),
      OtherDimension: t.column(t.string(), 'OtherDimension'),
      CoffeePrice: t.column(t.number(), 'City'),
    },
  });

  testRealm = new Realm(testContext);
  testRealm.stack.set('City', Value.fromJS(['Lisbon', 'Faro']));
  testRealm.stack.set('CoffeePrice', Value.fromJS([70, 90]));
});

it('infers sets', async () => {
  expect(
    await inferCategories(testRealm, categories('Name', col(1, 2)))
  ).toMatchObject({
    cellType: {
      type: 'number',
    },
  });

  expect(testContext.stack.get('Name')).toBeDefined();
});

it('does not infer inside functions', async () => {
  await testContext.stack.withPush(async () => {
    expect(
      (await inferCategories(testRealm, categories('Name', col(1, 2))))
        .errorCause?.spec?.errType
    ).toMatchInlineSnapshot(`"forbidden-inside-function"`);
  });
});

it('does not accept already-existing variable names', async () => {
  expect(
    await inferCategories(testRealm, categories('City', col(1, 2)))
  ).toMatchObject({
    errorCause: { spec: { errType: 'duplicated-name' } },
  });
});
