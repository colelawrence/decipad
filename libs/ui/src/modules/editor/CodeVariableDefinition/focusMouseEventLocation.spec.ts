import { describe, beforeEach, it, expect, vi } from 'vitest';
import * as plate from '@udecode/plate-common';
import { TElement } from '@udecode/plate-common';
import { createMyPlateEditor, MyEditor } from '@decipad/editor-types';
import { MouseEvent } from 'react';
import { focusMouseEventLocation } from './CodeVariableDefinition';

vi.mock('@udecode/plate-common', async (requireActual) => ({
  __esModule: true,
  ...((await requireActual()) as object),
}));

describe('focusMouseEventLocation', () => {
  let editor: MyEditor;
  let element: TElement;
  let event: MouseEvent<HTMLSpanElement>;

  beforeEach(() => {
    editor = createMyPlateEditor();
    element = {} as any;
    event = {} as any;
  });

  it('should focus editor at the event range when available', () => {
    const targetLocation = { path: [0, 0], offset: 1 };
    vi.spyOn(plate, 'findEventRange').mockReturnValue(targetLocation as any);
    const focusEditor = vi.fn();
    vi.spyOn(plate, 'focusEditor').mockImplementation(focusEditor as any);

    focusMouseEventLocation(editor, element, event);

    expect(focusEditor).toHaveBeenCalledWith(editor, targetLocation);
  });

  it('should focus editor at the start point when event range is not available', () => {
    vi.spyOn(plate, 'findEventRange').mockReturnValue(undefined);
    vi.spyOn(plate, 'findNodePath').mockReturnValue([0]);
    const focusEditor = vi.fn();
    vi.spyOn(plate, 'focusEditor').mockImplementation(focusEditor as any);

    const targetLocation = { path: [0], offset: 0 };
    vi.spyOn(plate, 'getStartPoint').mockReturnValue(targetLocation);

    focusMouseEventLocation(editor, element, event);

    expect(focusEditor).toHaveBeenCalledWith(editor, targetLocation);
  });

  it('should not focus editor when event range and start point are not available', () => {
    vi.spyOn(plate, 'findEventRange').mockReturnValue(undefined);
    vi.spyOn(plate, 'findNodePath').mockReturnValue(undefined);
    const focusEditor = vi.fn();
    vi.spyOn(plate, 'focusEditor').mockImplementation(focusEditor as any);

    focusMouseEventLocation(editor, element, event);

    expect(focusEditor).not.toHaveBeenCalled();
  });
});
