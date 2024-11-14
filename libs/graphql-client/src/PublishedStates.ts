/**
 * This type is a little confusing so it deserves some explanation
 *
 * `undefined` = The notebook itself isn't published.
 *
 * `"up-to-date"` = There is no difference between published version and current one.
 * `"first-time-publish"` = The most confusing one
 *     - When the user first publishes their notebook, they set the `isPublic` flag on the backend.
 *     - This doesn't mean they have a published snapshot, to do this they'll have to hit the "publish" button.
 *
 * `"unpublished-changes"` = The notebook has been published in the past, but needs to be updated because
 *     the snapshot no longer matches the current notebook version.
 */
export type PublishedVersionState =
  | undefined
  | 'up-to-date'
  | 'first-time-publish'
  | 'unpublished-changes';

// Link in `graphql-client` to prevent circular imports.
export const PublishedVersionName = {
  // When the user publishes a notebook, this is the name of the snapshot.
  Published: 'Published 1',
  // When the user unpublished a notebook, we don't want to delete in case
  // we want to go back to it in the future.
  Unpublished: 'Unpublished 1',
} as const;
