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
      currentSnapshot: {
        createdAt: '2022-12-17T03:24:00',
        updatedAt: '2022-12-17T03:34:00',
        snapshotName: 'Published 1',
      },
      link: 'https://decipad.com/notebook/nbid',
      setShareMenuOpen: () => noop,
      hasUnpublishedChanges: false,
      isPublished: true,
      isAdmin: true,
      isPublishing: false,
      onPublish: () => noop,
      onUnpublish: () => noop,
    };

    const { getByRole, queryByTestId } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(getByRole('checkbox').getAttribute('aria-checked')).toBeTruthy();
    expect(queryByTestId('publish-changes')).toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on', async () => {
    const props: ComponentProps<typeof NotebookPublishTab> = {
      currentSnapshot: {
        createdAt: '2022-12-17T03:24:00',
        updatedAt: '2022-12-17T03:34:00',
        snapshotName: 'Published 1',
      },
      link: 'https://decipad.com/notebook/nbid',
      setShareMenuOpen: () => noop,
      hasUnpublishedChanges: true,
      isPublished: true,
      isAdmin: true,
      isPublishing: false,
      onPublish: () => noop,
      onUnpublish: () => noop,
    };

    const { getByRole, queryByTestId } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
    expect(queryByTestId('publish-changes')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on but with created date', async () => {
    const props: ComponentProps<typeof NotebookPublishTab> = {
      currentSnapshot: {
        createdAt: '2022-12-17T03:24:00',
        updatedAt: '2022-12-17T03:34:00',
        snapshotName: 'Published 1',
      },
      link: 'https://decipad.com/notebook/nbid',
      setShareMenuOpen: () => noop,
      isAdmin: true,
      hasUnpublishedChanges: true,
      isPublished: true,
      isPublishing: false,
      onPublish: () => noop,
      onUnpublish: () => noop,
    };

    const { queryByTestId } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(queryByTestId('version-date')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle on with updated date', async () => {
    const props: ComponentProps<typeof NotebookPublishTab> = {
      currentSnapshot: {
        createdAt: '2022-12-17T03:24:00',
        updatedAt: '2022-12-17T03:34:00',
        snapshotName: 'Published 1',
      },
      link: 'https://decipad.com/notebook/nbid',
      setShareMenuOpen: () => noop,
      hasUnpublishedChanges: true,
      isPublished: true,
      isAdmin: true,
      isPublishing: false,
      onPublish: () => noop,
      onUnpublish: () => noop,
    };

    const { queryByTestId } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(queryByTestId('version-date')).not.toBeNull();
  });

  it('should render the notebook popup with changes to publish and the published toggle off', async () => {
    const props: ComponentProps<typeof NotebookPublishTab> = {
      currentSnapshot: {
        createdAt: '2022-12-17T03:24:00',
        updatedAt: '2022-12-17T03:34:00',
        snapshotName: 'Published 1',
      },
      link: 'https://decipad.com/notebook/nbid',
      setShareMenuOpen: () => noop,
      hasUnpublishedChanges: true,
      isPublished: false,
      isPublishing: false,
      isAdmin: true,
      onPublish: () => noop,
      onUnpublish: () => noop,
    };

    const { getByRole } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('false');
  });

  it('should render the proper notebook popup when it is being published', async () => {
    const props: ComponentProps<typeof NotebookPublishTab> = {
      currentSnapshot: {
        createdAt: '2022-12-17T03:24:00',
        updatedAt: '2022-12-17T03:34:00',
        snapshotName: 'Published 1',
      },
      link: 'https://decipad.com/notebook/nbid',
      setShareMenuOpen: () => noop,
      hasUnpublishedChanges: true,
      isPublished: true,
      isAdmin: true,
      isPublishing: true,
      onPublish: () => noop,
      onUnpublish: () => noop,
    };

    const { getByRole } = render(
      <NotebookPublishTab {...props}></NotebookPublishTab>
    );

    expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
  });
});
