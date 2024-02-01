import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import fetch from 'jest-fetch-mock';
import { ComponentProps } from 'react';
import { NotebookPublishTab } from './NotebookPublishTab';

describe('NotebookPublishingPopUp organism', () => {
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
        snapshotName: 'Published 1',
      },
      link: 'https://decipad.com/notebook/nbid',
      hasUnpublishedChanges: 'unpublished-changes',
      isPremium: false,
      publishingState: 'PRIVATE',
      isAdmin: true,
      isPublishing: false,
      setIsPublishing: () => noop,
      onUpdatePublish: () => noop as any,

      notebookId: 'id',
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
        snapshotName: 'Published 1',
      },
      link: 'https://decipad.com/notebook/nbid',
      hasUnpublishedChanges: 'unpublished-changes',
      isPremium: false,
      publishingState: 'PUBLIC',
      isAdmin: true,
      isPublishing: false,
      setIsPublishing: () => noop,
      onUpdatePublish: () => noop as any,

      notebookId: 'id',
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
        snapshotName: 'Published 1',
      },
      link: 'https://decipad.com/notebook/nbid',
      isAdmin: true,
      hasUnpublishedChanges: 'unpublished-changes',
      isPremium: false,
      publishingState: 'PUBLIC',
      isPublishing: false,
      setIsPublishing: () => noop,
      onUpdatePublish: () => noop as any,

      notebookId: 'id',
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
        snapshotName: 'Published 1',
      },
      link: 'https://decipad.com/notebook/nbid',
      hasUnpublishedChanges: 'unpublished-changes',
      isPremium: false,
      publishingState: 'PUBLIC',
      isAdmin: true,
      isPublishing: false,
      setIsPublishing: () => noop,
      onUpdatePublish: () => noop as any,

      notebookId: 'id',
    };

    const { queryByTestId } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(queryByTestId('version-date')).not.toBeNull();
  });
});
