import { RootDocument } from '@decipad/editor-types';
import { codeAssistant } from '../codeAssistant';
import noCodeDoc from './__fixtures__/no-code.json';
import doc from './__fixtures__/simple-code-lines.json';
import { setupTest } from './_setupTest';
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';

test('code from scratch assistant', (ctx) => {
  setupTest(ctx, doc as RootDocument);
  it('works for doing a simple calculation', async () => {
    expect(
      await codeAssistant({
        notebook: noCodeDoc as RootDocument,
        prompt: 'Calculate the cosine of angle in variable Angle',
      })
    ).toBe('cos(Angle)');
  }, 120000);
});
