/* eslint-disable import/first */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { N } from '@decipad/number';
import { dndPreviewActions } from '@decipad/react-contexts';
import { onDragStartSmartRef } from './onDragStartSmartRef';

vi.mock('@udecode/plate-common', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  findNodePath: () => [],
  getNodeString: () => '',
}));

describe('onDragStartSmartRef', () => {
  let editor: any;
  let previewRef: any;
  let dragEvent: React.DragEvent;
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
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
    } as any;
    result = {
      type: {
        kind: 'number',
      },
      value: N('2'),
    };
  });

  it('should set editor.dragging to "smart-ref"', () => {
    onDragStartSmartRef(editor)({ asText: '' } as any)(dragEvent);
    expect(editor.dragging).toBe('smart-ref');
  });

  it('should call dndPreviewActions.previewText if element is present', () => {
    dndPreviewActions.previewText = vi.fn();

    const dragStartSmartRef = onDragStartSmartRef(editor);
    dragStartSmartRef({
      element: {
        id: 'mockId',
      } as any,
      asText: '',
      result,
    })(dragEvent);

    expect(dndPreviewActions.previewText).toHaveBeenCalledWith('2');
  });
});
