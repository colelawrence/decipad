import { DocSyncEditor } from '@decipad/docsync';
import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { PublishedVersionState } from '@decipad/interfaces';
import { dequal } from '@decipad/utils';
import { useEffect, useMemo, useState } from 'react';
import { concat, debounce, filter, interval, take } from 'rxjs';
import { Doc, applyUpdate } from 'yjs';

export interface Props {
  readonly notebookId: string;
  readonly docsync: DocSyncEditor | undefined;
}

/**
 * Hook to determine if we have unpublished changes.
 *
 * - We do this by taking the `initialState` from graphql, and parsing it into JSON array.
 * - Then we check every 2000 seconds on editor changes if these are equal
 * - Return that boolean value
 *
 * @note it uses `useGetNotebookMetaQuery`. So be careful where you use it.
 */
export function usePublishedVersionState({
  notebookId,
  docsync,
}: Props): PublishedVersionState {
  const [hasUnpublishedChanges, setHasUnpublishedChanges] =
    useState<PublishedVersionState>(undefined);

  //
  // Used in components where `useGetNotebookMetaQuery` is already used
  // So this should come from cache and cause no further suspense barriers hits.
  //
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  const publishedSnapshot = meta.data?.getPadById?.snapshots.find(
    (s) => s.snapshotName === 'Published 1'
  );

  //
  // Get the snapshot data for the published version of the notebook.
  // And turn it into an array for us to check equality later on.
  //
  const publishedState: any[] | undefined = useMemo(() => {
    if (!meta.data?.getPadById?.isPublic) {
      return undefined;
    }

    if (docsync == null || publishedSnapshot?.data == null) {
      return [];
    }

    const doc = new Doc();
    applyUpdate(doc, Buffer.from(publishedSnapshot.data, 'base64'));

    return doc.getArray().toJSON();
  }, [docsync, meta.data?.getPadById?.isPublic, publishedSnapshot?.data]);

  useEffect(() => {
    if (docsync == null) {
      return;
    }

    //
    // We want the user to be instantly presented with the
    // "publish changes" button as soon as they select the dropdown option
    //
    // But, this goes against out `debounce`, so what we do is use concat
    // to join 2 observers.
    //
    // The first one `take(1)`, finishes after exactly one event. The event that
    // happens below `docsync.events.next()`.
    //
    // After this we take the regular debounced calls.
    //
    const anyChangeDelayedSub = concat(
      docsync.events.pipe(take(1)),
      docsync.events.pipe(
        debounce(() => interval(1000)),
        filter((e) => e.type === 'any-change')
      )
    );

    const s = anyChangeDelayedSub.subscribe(() => {
      if (publishedState == null) {
        return;
      }

      if (dequal(docsync.children, publishedState)) {
        setHasUnpublishedChanges('up-to-date');
        return;
      }

      // We are published, but dont yet have a snapshot.
      // This means its the first time the user is publishing.
      if (publishedSnapshot == null) {
        setHasUnpublishedChanges('first-time-publish');
        return;
      }

      setHasUnpublishedChanges('unpublished-changes');
    });

    // Fire once when use effect is first called.
    docsync.events.next({ type: 'any-change' });

    return () => {
      s.unsubscribe();
    };
  }, [docsync, publishedSnapshot, publishedState]);

  return hasUnpublishedChanges;
}
