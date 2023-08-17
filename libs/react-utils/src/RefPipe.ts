/**
 * A ref callback can be thought of as an onMount/onUnmount event handler. In
 * order to "pipe" a ref from one component to a sibling component via a shared
 * parent, we can use the observer pattern to re-broadcast this event to
 * subscribers.
 *
 * A RefPipe object is created in the parent component with useState (to ensure
 * it remains stable). The consumer component subscribes to the pipe by calling
 * `pipe.subscribe(ref)` inside a useEffect hook, and unsubscribes by calling
 * `pipe.unsubscribe(ref)`, where `ref` is a ref callback or any other function
 * that can consume the piped value.
 *
 * When the HTML element mounts or unmounts, the element object is dispatched to
 * the pipe using `ref={pipe.toRef()}` and broadcast to all subscribers.
 *
 * If the HTML element is already mounted when the consumer subscribes, the
 * latest value is immediately dispatched to the subscriber. In this way,
 * RefPipe differs from the standard observer pattern.
 */
export class RefPipe<T> {
  private value: T | undefined = undefined;
  private isDefined = false;
  private subscribers: ((value: T) => void)[] = [];

  subscribe(fn: (value: T) => void) {
    this.subscribers.push(fn);

    if (this.isDefined) {
      fn(this.value!);
    }
  }

  unsubscribe(fn: (value: T) => void) {
    this.subscribers = this.subscribers.filter(
      (subscriber) => subscriber !== fn
    );
  }

  toRef() {
    return (value: T) => {
      this.value = value;
      this.isDefined = true;
      this.subscribers.forEach((subscriber) => subscriber(value));
    };
  }
}
