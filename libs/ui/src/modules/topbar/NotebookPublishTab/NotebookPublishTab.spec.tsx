import { vi } from 'vitest';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import createFetch from 'vitest-fetch-mock';
import { ComponentProps } from 'react';
import { NotebookPublishTab } from './NotebookPublishTab';
import { PublishedVersionName } from '@decipad/interfaces';

describe('NotebookPublishingPopUp organism', () => {
  const fetch = createFetch(vi);

  beforeAll(() => {
    fetch.enableMocks();
  });

  afterAll(() => {
    fetch.disableMocks();
  });
  it('should render the notebook popup with no changes to publish and the published toggle on', async () => {
    const props: ComponentProps<typeof NotebookPublishTab> = {
      onPublish: async () => {},
      currentSnapshot: {
        createdAt: '2022-12-17T03:24:00',
        updatedAt: '2022-12-17T03:34:00',
        snapshotName: PublishedVersionName.Published,
      },
      link: 'https://decipad.com/notebook/nbid',
      publishedVersionState: 'unpublished-changes',
      isPremium: false,
      publishingState: 'PRIVATE',
      isAdmin: true,
      onUpdatePublish: () => noop as any,

      notebookId: 'id',
      allowDuplicate: true,
      onUpdateAllowDuplicate: async () => {},
    };

    const { queryByTestId } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(queryByTestId('publish-changes')).toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on', async () => {
    const props: ComponentProps<typeof NotebookPublishTab> = {
      onPublish: async () => {},
      currentSnapshot: {
        createdAt: '2022-12-17T03:24:00',
        updatedAt: '2022-12-17T03:34:00',
        snapshotName: PublishedVersionName.Published,
      },
      link: 'https://decipad.com/notebook/nbid',
      publishedVersionState: 'unpublished-changes',
      isPremium: false,
      publishingState: 'PUBLIC',
      isAdmin: true,
      onUpdatePublish: () => noop as any,

      notebookId: 'id',

      allowDuplicate: true,
      onUpdateAllowDuplicate: async () => {},
    };

    const { queryByTestId } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(queryByTestId('publish-changes')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on but with created date', async () => {
    const props: ComponentProps<typeof NotebookPublishTab> = {
      onPublish: async () => {},
      currentSnapshot: {
        createdAt: '2022-12-17T03:24:00',
        updatedAt: '2022-12-17T03:34:00',
        snapshotName: PublishedVersionName.Published,
      },
      link: 'https://decipad.com/notebook/nbid',
      isAdmin: true,
      publishedVersionState: 'unpublished-changes',
      isPremium: false,
      publishingState: 'PUBLIC',
      onUpdatePublish: () => noop as any,

      notebookId: 'id',
      allowDuplicate: true,
      onUpdateAllowDuplicate: async () => {},
    };

    const { queryByTestId } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(queryByTestId('version-date')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on with updated date', async () => {
    const props: ComponentProps<typeof NotebookPublishTab> = {
      onPublish: async () => {},
      currentSnapshot: {
        createdAt: '2022-12-17T03:24:00',
        updatedAt: '2022-12-17T03:34:00',
        snapshotName: PublishedVersionName.Published,
      },
      link: 'https://decipad.com/notebook/nbid',
      publishedVersionState: 'unpublished-changes',
      isPremium: false,
      publishingState: 'PUBLIC',
      isAdmin: true,
      onUpdatePublish: () => noop as any,

      notebookId: 'id',

      allowDuplicate: true,
      onUpdateAllowDuplicate: async () => {},
    };

    const { queryByTestId } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(queryByTestId('version-date')).not.toBeNull();
  });
});
