import { RefPipe } from './RefPipe';

describe('RefPipe', () => {
  describe('when subscribing before dispatching', () => {
    it('should call the handler with the dispatched value', () => {
      const pipe = new RefPipe<number>();
      const handler = jest.fn();
      pipe.subscribe(handler);
      expect(handler).not.toHaveBeenCalled();
      pipe.toRef()(1);
      expect(handler).toHaveBeenCalledWith(1);
    });
  });

  describe('when subscribing and unsubscribing before dispatching', () => {
    it('should not call the handler', () => {
      const pipe = new RefPipe<number>();
      const handler = jest.fn();
      pipe.subscribe(handler);
      pipe.unsubscribe(handler);
      pipe.toRef()(1);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('when subscribing after dispatching', () => {
    it('should call the handler with the dispatched value', () => {
      const pipe = new RefPipe<number>();
      const handler = jest.fn();
      pipe.toRef()(1);
      pipe.subscribe(handler);
      expect(handler).toHaveBeenCalledWith(1);
    });
  });
});
