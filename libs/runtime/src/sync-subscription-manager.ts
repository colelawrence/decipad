import { Observable, Subject } from 'rxjs';
import { Doc } from 'automerge';

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
    let count = this.outObservablesSubscriberCount.get(topic);
    if (count === undefined || count === 0) {
      throw new Error(
        `Tried unsubscribing topic ${topic} without subscriptions`
      );
    }
    count--;
    this.outObservablesSubscriberCount.set(topic, count);
    if (count === 0) {
      const outObservables = this.outObservables.get(topic);
      if (outObservables === undefined) {
        throw new Error(
          `Tried unsubscribing topic ${topic} without subscriptions`
        );
      }
      outObservables.complete();
      this.outObservables.delete(topic);
      this.topicObservable.next({ op: 'remove', topic });
    }

    const inObservables = this.inObservables.get(topic);
    if (inObservables === undefined) {
      throw new Error(
        `Tried unsubscribing topic ${topic} without in observables`
      );
    }
    const index = inObservables.indexOf(inObservable);
    if (index < 0) {
      throw new Error(
        `Tried unsubscribing topic ${topic} without in observables`
      );
    }
    inObservables.splice(index, 1);
  }

  stop() {
    for (const o of this.outObservables.values()) {
      o.complete();
    }
  }
}
