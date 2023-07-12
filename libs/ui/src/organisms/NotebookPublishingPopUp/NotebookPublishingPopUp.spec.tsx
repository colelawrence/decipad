import { noop } from '@decipad/utils';
import { act, render } from '@testing-library/react';
import fetch from 'jest-fetch-mock';
import { ComponentProps } from 'react';
import { NotebookPublishingPopUp } from './NotebookPublishingPopUp';

jest.mock('../NotebookInvitationPopUp/NotebookInvitationPopUp', () => ({
  NotebookInvitationPopUp: () => null,
}));

describe('NotebookPublishingPopUp organism', () => {
  beforeAll(() => {
    fetch.enableMocks();
  });

  afterAll(() => {
    fetch.disableMocks();
  });
  it('should render the notebook popup with no changes to publish and the published toggle on', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebook: { id: 'nbid', name: 'My first notebook' },
      hasUnpublishedChanges: false,
      isPublished: true,
      isPublishing: false,
      isAdmin: true,
      onPublish: () => noop,
      onRestore: () => noop,
      onUnpublish: () => noop,
    };

    const { getByRole, queryByTestId } = render(
      <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
    );

    const publishButton = queryByTestId('publish-button');

    await act(() => {
      publishButton?.click();
    });

    expect(publishButton?.getAttribute('disabled')).toBeNull();
    expect(getByRole('checkbox').getAttribute('aria-checked')).toBeTruthy();
    expect(queryByTestId('publish-changes')).toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebook: {
        id: 'nbid',
        name: 'My first notebook',
        snapshots: [
          {
            createdAt: '2022-12-17T03:24:00',
            updatedAt: '2022-12-17T03:34:00',
            snapshotName: 'Published 1',
          },
        ],
      },
      hasUnpublishedChanges: true,
      isPublished: true,
      isAdmin: true,
      isPublishing: false,
      onPublish: () => noop,
      onRestore: () => noop,
      onUnpublish: () => noop,
    };

    const { getByRole, queryByTestId } = render(
      <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
    );

    const publishButton = queryByTestId('publish-button');

    await act(() => {
      publishButton?.click();
    });

    expect(publishButton?.getAttribute('disabled')).toBeNull();
    expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
    expect(queryByTestId('publish-changes')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on but with created date', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebook: {
        id: 'nbid',
        name: 'My first notebook',
        snapshots: [
          {
            createdAt: '2022-12-17T03:24:00',
            snapshotName: 'Published 1',
          },
        ],
      },
      isAdmin: true,
      hasUnpublishedChanges: true,
      isPublished: true,
      isPublishing: false,
      onPublish: () => noop,
      onRestore: () => noop,
      onUnpublish: () => noop,
    };

    const { queryByTestId } = render(
      <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
    );

    const publishButton = queryByTestId('publish-button');

    await act(() => {
      publishButton?.click();
    });

    expect(queryByTestId('version-date')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on with updated date', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebook: {
        id: 'nbid',
        name: 'My first notebook',
        snapshots: [
          {
            updatedAt: '2022-12-17T03:24:00',
            snapshotName: 'Published 1',
          },
        ],
      },
      hasUnpublishedChanges: true,
      isPublished: true,
      isAdmin: true,
      isPublishing: false,
      onPublish: () => noop,
      onRestore: () => noop,
      onUnpublish: () => noop,
    };

    const { queryByTestId } = render(
      <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
    );

    const publishButton = queryByTestId('publish-button');

    await act(() => {
      publishButton?.click();
    });

    expect(queryByTestId('version-date')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle but without any date', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebook: {
        id: 'nbid',
        name: 'My first notebook',
        snapshots: [
          {
            snapshotName: 'Published 1',
          },
        ],
      },
      hasUnpublishedChanges: true,
      isPublished: true,
      isPublishing: false,
      isAdmin: true,
      onPublish: () => noop,
      onRestore: () => noop,
      onUnpublish: () => noop,
    };

    const { queryByTestId } = render(
      <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
    );

    const publishButton = queryByTestId('publish-button');

    await act(() => {
      publishButton?.click();
    });

    expect(queryByTestId('version-date')).toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle off', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebook: {
        id: 'nbid',
        name: 'My first notebook',
      },
      hasUnpublishedChanges: true,
      isPublished: false,
      isPublishing: false,
      isAdmin: true,
      onPublish: () => noop,
      onRestore: () => noop,
      onUnpublish: () => noop,
    };

    const { getByRole, queryByTestId } = render(
      <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
    );

    const publishButton = queryByTestId('publish-button');

    await act(() => {
      publishButton?.click();
    });

    expect(publishButton?.getAttribute('disabled')).toBeNull();
    expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('false');
  });

  it('should render the proper notebook popup when it is being published', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebook: {
        id: 'nbid',
        name: 'My first notebook',
      },
      hasUnpublishedChanges: true,
      isPublished: true,
      isAdmin: true,
      isPublishing: true,
      onPublish: () => noop,
      onRestore: () => noop,
      onUnpublish: () => noop,
    };

    const { getByRole, queryByTestId } = render(
      <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
    );

    const publishButton = queryByTestId('publish-button');

    await act(() => {
      publishButton?.click();
    });

    expect(publishButton?.getAttribute('disabled')).toBeNull();
    expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
  });
});
