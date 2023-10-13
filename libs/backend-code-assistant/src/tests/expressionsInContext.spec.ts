import { RootDocument } from '@decipad/editor-types';
import { codeAssistant } from '../codeAssistant';
import doc from './__fixtures__/simple-code-lines.json';

describe('code from scratch assistant', () => {
  it('works for doing a simple calculation', async () => {
    expect(
      await codeAssistant({
        notebook: doc as RootDocument,
        prompt: 'Calculate the office monthly rent cost',
      })
    ).toContain('OfficeArea * MonthlyRentCost');
    // TODO: improve this match
  });
});
