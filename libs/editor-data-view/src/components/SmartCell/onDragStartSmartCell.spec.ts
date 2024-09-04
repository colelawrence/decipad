import { beforeEach, expect, describe, it, vi } from 'vitest';
import type React from 'react';
import { DeciNumber } from '@decipad/number';
import { dndPreviewActions } from '@decipad/react-contexts';
import { DRAG_SMART_CELL } from '@decipad/editor-plugins';
import { onDragStartSmartCell } from './onDragStartSmartCell';

vi.mock('@udecode/plate-common', async (requireActual) => ({
  ...((await requireActual()) as object),
  findNodePath: () => [],
  getNodeString: () => '',
}));

describe('onDragStartSmartCell', () => {
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
      setFragmentData: vi.fn(),
    };
    dragEvent = {
      dataTransfer: {
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
    } as any;
    result = {
      type: {
        kind: 'number',
      },
      value: new DeciNumber('2'),
    };
  });

  it('should set editor.dragging to "smart-ref"', () => {
    onDragStartSmartCell(editor)({ computer, expression: '', result })(
      dragEvent
    );
    expect(editor.dragging).toBe(DRAG_SMART_CELL);
  });

  it('should call dndPreviewActions.previewText if element is present', () => {
    dndPreviewActions.previewText = vi.fn();

    const dragStartSmartRef = onDragStartSmartCell(editor);
    dragStartSmartRef({
      expression: '2 + 2',
      computer,
      result,
    })(dragEvent);

    expect(dndPreviewActions.previewText).toHaveBeenCalledWith('2');
  });
});
