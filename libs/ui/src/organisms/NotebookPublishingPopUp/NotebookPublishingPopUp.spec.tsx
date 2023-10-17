import { noop } from '@decipad/utils';
import { act, render } from '@testing-library/react';
import fetch from 'jest-fetch-mock';
import { ComponentProps } from 'react';
import { NotebookPublishingPopUp } from './NotebookPublishingPopUp';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../NotebookCollaborateTab/NotebookCollaborateTab.tsx', () => ({
  NotebookInvitationPopUp: () => null,
}));

describe('NotebookPublishingPopUp organism', () => {
  beforeAll(() => {
    fetch.enableMocks();
  });

  afterAll(() => {
    fetch.disableMocks();
  });

  it('should render the notebook popup with changes to publish and the published toggle on', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebookId: 'notebookid',
      workspaceId: 'workspaceid',
      notebookName: 'notebookName',
      snapshots: [
        {
          snapshotName: 'Published 1',
          updatedAt: new Date().getTime(),
        },
      ],
      onChange: noop as any,
      onInvite: noop as any,
      onRemove: noop as any,

      hasUnpublishedChanges: true,
      isPublished: true,
      isAdmin: true,
      onPublish: () => noop as any,
      onRestore: () => noop,
      onUnpublish: () => noop as any,
    };

    const { getByRole, queryByTestId } = render(
      <BrowserRouter>
        <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
      </BrowserRouter>
    );

    const publishButton = queryByTestId('publish-button');

    act(() => {
      publishButton?.click();
    });

    expect(publishButton?.getAttribute('disabled')).toBeNull();
    expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
    expect(queryByTestId('publish-changes')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on but with created date', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebookId: 'notebookid',
      workspaceId: 'workspaceid',
      notebookName: 'notebookName',
      snapshots: [
        {
          snapshotName: 'Published 1',
          createdAt: new Date().getTime(),
        },
      ],
      onChange: noop as any,
      onInvite: noop as any,
      onRemove: noop as any,
      isAdmin: true,
      hasUnpublishedChanges: true,
      isPublished: true,
      onPublish: () => noop as any,
      onRestore: () => noop,
      onUnpublish: () => noop as any,
    };

    const { queryByTestId } = render(
      <BrowserRouter>
        <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
      </BrowserRouter>
    );

    const publishButton = queryByTestId('publish-button');

    act(() => {
      publishButton?.click();
    });

    expect(queryByTestId('version-date')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on with updated date', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebookId: 'notebookid',
      workspaceId: 'workspaceid',
      notebookName: 'notebookName',
      snapshots: [
        {
          snapshotName: 'Published 1',
          updatedAt: new Date().getTime(),
        },
      ],
      onChange: noop as any,
      onInvite: noop as any,
      onRemove: noop as any,
      hasUnpublishedChanges: true,
      isPublished: true,
      isAdmin: true,
      onPublish: () => noop as any,
      onRestore: () => noop,
      onUnpublish: () => noop as any,
    };

    const { queryByTestId } = render(
      <BrowserRouter>
        <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
      </BrowserRouter>
    );

    const publishButton = queryByTestId('publish-button');

    act(() => {
      publishButton?.click();
    });

    expect(queryByTestId('version-date')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle but without any date', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebookId: 'notebookid',
      workspaceId: 'workspaceid',

      notebookName: 'notebookName',
      snapshots: [
        {
          snapshotName: 'Published 1',
        },
      ],
      onChange: noop as any,
      onInvite: noop as any,
      onRemove: noop as any,
      hasUnpublishedChanges: true,
      isPublished: true,
      isAdmin: true,
      onPublish: () => noop as any,
      onRestore: () => noop,
      onUnpublish: () => noop as any,
    };

    const { queryByTestId } = render(
      <BrowserRouter>
        <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
      </BrowserRouter>
    );

    const publishButton = queryByTestId('publish-button');

    act(() => {
      publishButton?.click();
    });

    expect(queryByTestId('version-date')).toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle off', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebookId: 'notebookid',
      workspaceId: 'workspaceid',
      notebookName: 'notebookName',
      snapshots: [
        {
          snapshotName: 'Published 1',
        },
      ],
      onChange: noop as any,
      onInvite: noop as any,
      onRemove: noop as any,
      hasUnpublishedChanges: true,
      isPublished: false,
      isAdmin: true,
      onPublish: () => noop as any,
      onRestore: () => noop,
      onUnpublish: () => noop as any,
    };

    const { getByRole, queryByTestId } = render(
      <BrowserRouter>
        <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
      </BrowserRouter>
    );

    const publishButton = queryByTestId('publish-button');

    act(() => {
      publishButton?.click();
    });

    expect(publishButton?.getAttribute('disabled')).toBeNull();
    expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('false');
  });

  it('should render the proper notebook popup when it is being published', async () => {
    const props: ComponentProps<typeof NotebookPublishingPopUp> = {
      notebookId: 'notebookid',
      workspaceId: 'workspaceid',
      notebookName: 'notebookName',
      snapshots: [
        {
          snapshotName: 'Published 1',
        },
      ],
      onChange: noop as any,
      onInvite: noop as any,
      onRemove: noop as any,
      hasUnpublishedChanges: true,
      isPublished: true,
      isAdmin: true,
      onPublish: () => noop as any,
      onRestore: () => noop,
      onUnpublish: () => noop as any,
    };

    const { getByRole, queryByTestId } = render(
      <BrowserRouter>
        <NotebookPublishingPopUp {...props}></NotebookPublishingPopUp>
      </BrowserRouter>
    );

    const publishButton = queryByTestId('publish-button');

    act(() => {
      publishButton?.click();
    });

    expect(publishButton?.getAttribute('disabled')).toBeNull();
    expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
  });
});
