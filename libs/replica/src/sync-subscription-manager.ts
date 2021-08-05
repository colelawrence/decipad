import { Observable, Subject } from 'rxjs';
import { Doc } from 'automerge';
import { RemoteOp, Mutation, TopicSubscriptionOperation } from './types';

export class SyncSubscriptionManager<T> {
  private outObservables: Map<string, Subject<RemoteOp>> = new Map();
  private outObservablesSubscriberCount: Map<string, number> = new Map();
  private inObservables: Map<
    string,
    Observable<Mutation<Doc<{ value: T }>>>[]
  > = new Map();
  topicObservable = new Subject<TopicSubscriptionOperation>();

  notifyRemoteOp(remoteOp: RemoteOp) {
    const { topic } = remoteOp;
    const outSubject = this.outObservables.get(topic);
    if (outSubject === undefined) {
      return;
    }
    outSubject.next(remoteOp);
  }

  subscribe(
    topic: string,
    inObservable: Observable<Mutation<Doc<{ value: T }>>>
  ): Observable<RemoteOp> {
    let out = this.outObservables.get(topic);
    if (out === undefined) {
      out = new Subject<RemoteOp>();
      this.outObservables.set(topic, out);
    }
    const count = this.outObservablesSubscriberCount.get(topic) || 0;
    this.outObservablesSubscriberCount.set(topic, count + 1);

    let topicInObservables = this.inObservables.get(topic);
    if (topicInObservables === undefined) {
      topicInObservables = [];
      this.inObservables.set(topic, topicInObservables);
    }

    topicInObservables.push(inObservable);

    if (topicInObservables.length === 1) {
      this.topicObservable.next({ op: 'add', topic });
    }

    return out;
  }

  unsubscribe(
    topic: string,
    inObservable: Observable<Mutation<Doc<{ value: T }>>>
  ) {
    //  we've set these in subscribe
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    let count = this.outObservablesSubscriberCount.get(topic)!;
    count -= 1;
    this.outObservablesSubscriberCount.set(topic, count);
    if (count === 0) {
      const outObservables = this.outObservables.get(topic)!;
      outObservables.complete();
      this.outObservables.delete(topic);
      this.topicObservable.next({ op: 'remove', topic });
    }

    const inObservables = this.inObservables.get(topic)!;
    const index = inObservables.indexOf(inObservable);
    inObservables.splice(index, 1);
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  }

  stop() {
    for (const o of this.outObservables.values()) {
      o.complete();
    }
  }
}
