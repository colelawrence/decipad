import type { RootDocument } from '@decipad/editor-types';
// eslint-disable-next-line no-restricted-imports
import { getComputer } from '@decipad/computer';
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { codeAssistant } from '../codeAssistant';
import doc from './__fixtures__/simple-code-lines.json';
import { setupTest } from './_setupTest';

test('code from scratch assistant', (ctx) => {
  setupTest(ctx, doc as RootDocument);
  it('works for doing a simple calculation', async () => {
    const result = await codeAssistant({
      notebook: doc as RootDocument,
      prompt:
        'calculate the total office monthly rent cost using MonthlyRentCostPerArea and OfficeArea',
      computer: getComputer(),
    });
    expect([
      'OfficeArea * MonthlyRentCostPerArea',
      'MonthlyRentCostPerArea * OfficeArea',
    ]).toContain(result);
  }, 120000);
});
