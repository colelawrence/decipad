import {
  DRAG_SMART_CELL_RESULT,
  onDragSmartCellResultStarted,
} from './onDragSmartCellResultStarted';

describe('onDragSmartCellResultStarted', () => {
  let editorMock: any;
  let dragEventMock: any;
  beforeEach(() => {
    editorMock = {
      dragging: null,
      previewRef: {
        current: { firstChild: { innerHTML: '2 + 2' } },
      },
      setFragmentData: jest.fn(),
    };
    dragEventMock = {
      dataTransfer: {
        setData: jest.fn(),
        setDragImage: jest.fn(),
      },
    };
  });

  it('should set the editor.dragging property to DRAG_SMART_CELL_RESULT', () => {
    onDragSmartCellResultStarted(editorMock)({
      expression: 'test expression',
    })(dragEventMock);
    expect(editorMock.dragging).toEqual(DRAG_SMART_CELL_RESULT);
  });

  it('should call setFragmentData with the dataTransfer and "drag"', () => {
    onDragSmartCellResultStarted(editorMock)({
      expression: 'test expression',
    })(dragEventMock);
    expect(editorMock.setFragmentData).toHaveBeenCalledWith(
      dragEventMock.dataTransfer,
      'drag'
    );
  });

  it('should set the textContent of the editor.previewRef.current to the provided expression and call setDragImage with the editor.previewRef.current, 0, 0', () => {
    onDragSmartCellResultStarted(editorMock)({
      expression: 'test expression',
    })(dragEventMock);
    expect(editorMock.previewRef.current.firstChild.innerHTML).toEqual(
      'test expression'
    );
    expect(dragEventMock.dataTransfer.setDragImage).toHaveBeenCalledWith(
      editorMock.previewRef.current,
      0,
      0
    );
  });
});
