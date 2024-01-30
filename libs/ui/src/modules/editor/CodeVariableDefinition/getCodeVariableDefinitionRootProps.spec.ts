import { getCodeVariableDefinitionRootProps } from './CodeVariableDefinition';

describe('getCodeVariableDefinitionRootProps', () => {
  let setGrabbing: jest.Mock;
  let onDragStartInlineResult: jest.Mock;
  let onDragEnd: jest.Mock;

  beforeEach(() => {
    setGrabbing = jest.fn();
    onDragStartInlineResult = jest.fn();
    onDragEnd = jest.fn();
  });

  it('should return an empty object when contentEditable is true', () => {
    const rootProps = getCodeVariableDefinitionRootProps({
      contentEditable: true,
      setGrabbing,
      onDragStartInlineResult,
      onDragEnd,
    });

    expect(rootProps).toEqual({});
  });

  it('should return the correct rootProps when contentEditable is false', () => {
    const rootProps = getCodeVariableDefinitionRootProps({
      contentEditable: false,
      setGrabbing,
      onDragStartInlineResult,
      onDragEnd,
    });

    expect(rootProps.draggable).toBe(true);
    expect(typeof rootProps.onDragStart).toBe('function');
    expect(typeof rootProps.onDragEnd).toBe('function');
  });

  it('should call the correct functions when contentEditable is false and events are triggered', () => {
    const rootProps = getCodeVariableDefinitionRootProps({
      contentEditable: false,
      setGrabbing,
      onDragStartInlineResult,
      onDragEnd,
    });

    const dragEvent = {} as any;

    rootProps.onDragStart?.(dragEvent);
    expect(onDragStartInlineResult).toHaveBeenCalledWith(dragEvent);
    expect(setGrabbing).toHaveBeenCalledWith(true);

    rootProps.onDragEnd?.(dragEvent);
    expect(onDragEnd).toHaveBeenCalledWith(dragEvent);
    expect(setGrabbing).toHaveBeenCalledWith(false);
  });
});
