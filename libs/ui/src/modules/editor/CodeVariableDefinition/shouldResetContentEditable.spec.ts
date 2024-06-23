import { vi } from 'vitest';
import { createMyPlateEditor } from '@decipad/editor-types';
import * as plate from '@udecode/plate-common';
import { eventEditorActions } from '@udecode/plate-common';
import { shouldResetContentEditable } from './CodeVariableDefinition';

vi.mock('@udecode/plate-common', async (requireActual) => ({
  __esModule: true,
  ...((await requireActual()) as object),
}));

describe('shouldResetContentEditable', () => {
  const editor = createMyPlateEditor();

  beforeEach(() => {
    eventEditorActions.blur('');
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
  });

  it('returns false if blurred and contentEditable is falsy', () => {
    eventEditorActions.blur('id');
    vi.spyOn(plate, 'someNode').mockReturnValue(true);

    const result = shouldResetContentEditable(editor, 'node-id', false);
    expect(result).toBe(false);
  });

  it('returns null if blurred but contentEditable is true', () => {
    eventEditorActions.blur('id');
    vi.spyOn(plate, 'someNode').mockReturnValue(true);

    const result = shouldResetContentEditable(editor, 'node-id', true);
    expect(result).toBe(null);
  });

  it('returns false if editor has no selection', () => {
    vi.spyOn(plate, 'someNode').mockReturnValue(true);

    editor.selection = null;

    const result = shouldResetContentEditable(editor, 'node-id', false);
    expect(result).toBe(false);
  });

  it('returns true if contentEditable is false and someNode is true', () => {
    vi.spyOn(plate, 'someNode').mockReturnValue(true);

    const result = shouldResetContentEditable(editor, 'node-id', false);
    expect(result).toBe(true);
  });

  it('returns null if contentEditable is false and someNode is false', () => {
    vi.spyOn(plate, 'someNode').mockReturnValue(false);

    const result = shouldResetContentEditable(editor, 'node-id', false);
    expect(result).toBe(null);
  });

  it('returns null if contentEditable is true and someNode is true', () => {
    vi.spyOn(plate, 'someNode').mockReturnValue(true);

    const result = shouldResetContentEditable(editor, 'node-id', true);
    expect(result).toBe(null);
  });

  it('returns false if contentEditable is true and someNode is false', () => {
    vi.spyOn(plate, 'someNode').mockReturnValue(false);

    const result = shouldResetContentEditable(editor, 'node-id', true);
    expect(result).toBe(false);
  });
});
