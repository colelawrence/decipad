import React from 'react';
import { DeciNumber } from '@decipad/number';
import { dndPreviewActions } from '@decipad/react-contexts';
import { onDragStartSmartRef } from './onDragStartSmartRef';

jest.mock('@udecode/plate', () => ({
  ...jest.requireActual('@udecode/plate'),
  findNodePath: () => [],
  getNodeString: () => '',
}));

describe('onDragStartSmartRef', () => {
  let editor: any;
  let previewRef: any;
  let dragEvent: React.DragEvent;
  let computer: any;
  let result: any;

  beforeEach(() => {
    previewRef = {
      current: { firstChild: { innerHTML: '2 + 2' } },
    };
    editor = {
      dragging: null,
      previewRef,
    };
    dragEvent = {
      dataTransfer: {
        setData: jest.fn(),
        setDragImage: jest.fn(),
      },
    } as any;
    computer = {
      formatNumber: jest.fn(() => ({
        asString: 'FormattedString',
      })),
    };
    result = {
      type: 'number',
      value: new DeciNumber('2'),
    };
  });

  it('should set editor.dragging to "smart-ref"', () => {
    onDragStartSmartRef(editor)({ asText: '' } as any)(dragEvent);
    expect(editor.dragging).toBe('smart-ref');
  });

  it('should call dndPreviewActions.previewText if element is present', () => {
    dndPreviewActions.previewText = jest.fn();

    const dragStartSmartRef = onDragStartSmartRef(editor);
    dragStartSmartRef({
      element: {
        id: 'mockId',
      } as any,
      asText: '',
      computer,
      result,
    })(dragEvent);

    expect(dndPreviewActions.previewText).toHaveBeenCalledWith(
      'FormattedString'
    );
  });
});
