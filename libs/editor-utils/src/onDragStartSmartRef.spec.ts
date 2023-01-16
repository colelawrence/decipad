import React from 'react';
import { onDragStartSmartRef } from './onDragStartSmartRef';
import * as getVariableRanges from './getVariableRanges';

jest.mock('@udecode/plate', () => ({
  ...jest.requireActual('@udecode/plate'),
  findNodePath: () => [],
  getNodeString: () => '',
}));

describe('onDragStartSmartRef', () => {
  let editor: any;
  let previewRef: any;
  let dragEvent: React.DragEvent;

  beforeEach(() => {
    editor = { dragging: null };
    previewRef = {
      current: { firstChild: { innerHTML: '2 + 2' } },
    };
    dragEvent = {
      dataTransfer: {
        setData: jest.fn(),
        setDragImage: jest.fn(),
      },
    } as any;
  });

  it('should set editor.dragging to "smart-ref"', () => {
    onDragStartSmartRef(editor)({ asText: '', previewRef })(dragEvent);
    expect(editor.dragging).toBe('smart-ref');
  });

  it('should set dragEvent.dataTransfer.setDragImage with the correct parameters when element is passed and variableName is available', () => {
    const element = { id: '123', type: 'code_line' } as any;
    const variableRanges: any = [
      { isDeclaration: true, variableName: 'testVar' },
    ];

    jest
      .spyOn(getVariableRanges, 'getVariableRanges')
      .mockReturnValue(variableRanges);

    onDragStartSmartRef(editor)({ element, asText: '', previewRef })(dragEvent);
    expect(dragEvent.dataTransfer.setDragImage).toHaveBeenCalledWith(
      previewRef.current,
      0,
      0
    );
    expect(previewRef.current.firstChild?.innerHTML).toBe('testVar');
  });
});
