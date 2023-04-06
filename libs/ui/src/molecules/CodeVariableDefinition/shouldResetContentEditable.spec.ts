import { createTPlateEditor } from '@decipad/editor-types';
import * as plate from '@udecode/plate';
import { eventEditorActions } from '@udecode/plate';
import { shouldResetContentEditable } from './CodeVariableDefinition';

jest.mock('@udecode/plate', () => ({
  __esModule: true,
  ...jest.requireActual('@udecode/plate'),
}));

describe('shouldResetContentEditable', () => {
  const editor = createTPlateEditor();

  beforeEach(() => {
    eventEditorActions.blur('');
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
  });

  it('returns false if blurred', () => {
    eventEditorActions.blur('id');
    jest.spyOn(plate, 'someNode').mockReturnValue(true);

    const result = shouldResetContentEditable(editor, 'node-id', false);
    expect(result).toBe(false);
  });

  it('returns false if editor has no selection', () => {
    jest.spyOn(plate, 'someNode').mockReturnValue(true);

    editor.selection = null;

    const result = shouldResetContentEditable(editor, 'node-id', false);
    expect(result).toBe(false);
  });

  it('returns true if contentEditable is false and someNode is true', () => {
    jest.spyOn(plate, 'someNode').mockReturnValue(true);

    const result = shouldResetContentEditable(editor, 'node-id', false);
    expect(result).toBe(true);
  });

  it('returns null if contentEditable is false and someNode is false', () => {
    jest.spyOn(plate, 'someNode').mockReturnValue(false);

    const result = shouldResetContentEditable(editor, 'node-id', false);
    expect(result).toBe(null);
  });

  it('returns null if contentEditable is true and someNode is true', () => {
    jest.spyOn(plate, 'someNode').mockReturnValue(true);

    const result = shouldResetContentEditable(editor, 'node-id', true);
    expect(result).toBe(null);
  });

  it('returns false if contentEditable is true and someNode is false', () => {
    jest.spyOn(plate, 'someNode').mockReturnValue(false);

    const result = shouldResetContentEditable(editor, 'node-id', true);
    expect(result).toBe(false);
  });
});
