import { encodeDocumentIds } from './encodeDocumentIds';
import notebook from './__fixtures__/notebook.json';
import { RootDocument } from '@decipad/editor-types';

describe('encodeDocumentIds', () => {
  it('encodes and decodes', () => {
    const [encoded, decode] = encodeDocumentIds(notebook as RootDocument);
    expect(encoded).toMatchSnapshot();
    expect(decode(encoded)).toEqual(notebook);
  });
});
