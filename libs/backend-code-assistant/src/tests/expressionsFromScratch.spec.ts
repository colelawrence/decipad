import { Document } from '@decipad/editor-types';
import { codeAssistant } from '../codeAssistant';
import noCodeDoc from './__fixtures__/no-code.json';

describe('code from scratch assistant', () => {
  it('works for doing a simple calculation', async () => {
    expect(
      await codeAssistant({
        notebook: noCodeDoc as Document,
        prompt: 'Calculate the cosine of a given angle',
      })
    ).toContain('cos');
    // TODO: improve this match
  }, 20000);
});
