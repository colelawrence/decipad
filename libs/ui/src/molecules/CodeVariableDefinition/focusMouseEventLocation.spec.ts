import * as plate from '@udecode/plate';
import { TElement } from '@udecode/plate';
import { createTPlateEditor, MyEditor } from '@decipad/editor-types';
import { MouseEvent } from 'react';
import { focusMouseEventLocation } from './CodeVariableDefinition';

jest.mock('@udecode/plate', () => ({
  __esModule: true,
  ...jest.requireActual('@udecode/plate'),
}));

describe('focusMouseEventLocation', () => {
  let editor: MyEditor;
  let element: TElement;
  let event: MouseEvent<HTMLSpanElement>;

  beforeEach(() => {
    editor = createTPlateEditor();
    element = {} as any;
    event = {} as any;
  });

  it('should focus editor at the event range when available', () => {
    const targetLocation = { path: [0, 0], offset: 1 };
    jest.spyOn(plate, 'findEventRange').mockReturnValue(targetLocation as any);
    const focusEditor = jest.fn();
    jest.spyOn(plate, 'focusEditor').mockImplementation(focusEditor as any);

    focusMouseEventLocation(editor, element, event);

    expect(focusEditor).toHaveBeenCalledWith(editor, targetLocation);
  });

  it('should focus editor at the start point when event range is not available', () => {
    jest.spyOn(plate, 'findEventRange').mockReturnValue(undefined);
    jest.spyOn(plate, 'findNodePath').mockReturnValue([0]);
    const focusEditor = jest.fn();
    jest.spyOn(plate, 'focusEditor').mockImplementation(focusEditor as any);

    const targetLocation = { path: [0], offset: 0 };
    jest.spyOn(plate, 'getStartPoint').mockReturnValue(targetLocation);

    focusMouseEventLocation(editor, element, event);

    expect(focusEditor).toHaveBeenCalledWith(editor, targetLocation);
  });

  it('should not focus editor when event range and start point are not available', () => {
    jest.spyOn(plate, 'findEventRange').mockReturnValue(undefined);
    jest.spyOn(plate, 'findNodePath').mockReturnValue(undefined);
    const focusEditor = jest.fn();
    jest.spyOn(plate, 'focusEditor').mockImplementation(focusEditor as any);

    focusMouseEventLocation(editor, element, event);

    expect(focusEditor).not.toHaveBeenCalled();
  });
});
