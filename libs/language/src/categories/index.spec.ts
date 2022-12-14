import { col, categories } from '../utils';
import { build as t } from '../type';
import { inferCategories } from '.';
import { Realm } from '../interpreter';
import { Context, makeContext } from '..';
import { fromJS } from '../value';

let testRealm: Realm;
let testContext: Context;
beforeEach(async () => {
  testContext = makeContext({
    initialGlobalScope: {
      City: t.column(t.string(), 2, 'City'),
      OtherDimension: t.column(t.string(), 2, 'OtherDimension'),
      CoffeePrice: t.column(t.number(), 2, 'City'),
    },
  });

  testRealm = new Realm(testContext);
  testRealm.stack.set('City', fromJS(['Lisbon', 'Faro']));
  testRealm.stack.set('CoffeePrice', fromJS([70, 90]));
});

it('infers sets', async () => {
  expect(
    await inferCategories(testContext, categories('Name', col(1, 2)))
  ).toMatchObject({
    cellType: {
      type: 'number',
    },
  });

  expect(testContext.stack.get('Name')).toBeDefined();
});

it('does not infer inside functions', async () => {
  await testContext.stack.withPushCall(async () => {
    expect(
      (await inferCategories(testContext, categories('Name', col(1, 2))))
        .errorCause?.spec?.errType
    ).toMatchInlineSnapshot(`"forbidden-inside-function"`);
  });
});

it('does not accept already-existing variable names', async () => {
  expect(
    await inferCategories(testContext, categories('City', col(1, 2)))
  ).toMatchObject({
    errorCause: { spec: { errType: 'duplicated-name' } },
  });
});
