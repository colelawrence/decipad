// eslint-disable-next-line no-restricted-imports
import { Value, buildType as t } from '@decipad/language-types';
import { col, categories } from '../utils';
import { inferCategories } from '.';
import type { ScopedInferContext, TRealm } from '../scopedRealm';
import { ScopedRealm, makeInferContext } from '../scopedRealm';

let testRealm: TRealm;
let testContext: ScopedInferContext;
beforeEach(() => {
  testContext = makeInferContext({
    initialGlobalScope: {
      City: t.column(t.string(), 'City'),
      OtherDimension: t.column(t.string(), 'OtherDimension'),
      CoffeePrice: t.column(t.number(), 'City'),
    },
  });

  testRealm = new ScopedRealm(undefined, testContext);
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
  const scopedRealm = testRealm.push('categories test');
  expect(
    (await inferCategories(scopedRealm, categories('Name', col(1, 2))))
      .errorCause?.spec?.errType
  ).toMatchInlineSnapshot(`"forbidden-inside-function"`);
});

it('does not accept already-existing variable names', async () => {
  expect(
    await inferCategories(testRealm, categories('City', col(1, 2)))
  ).toMatchObject({
    errorCause: { spec: { errType: 'duplicated-name' } },
  });
});
