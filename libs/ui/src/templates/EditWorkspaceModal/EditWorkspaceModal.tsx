/* eslint decipad/css-prop-named-variable: 0 */
import { isFlagEnabled } from '@decipad/feature-flags';
import { useSafeState } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import React, { ComponentProps, useCallback, useState } from 'react';
import { Button, InputField } from '../../atoms';
import { People } from '../../icons';
import { ClosableModal } from '../../organisms';
import { cssVar, p13Medium, p13Regular, setCssVar } from '../../primitives';

type EditWorkspaceModalProps = {
  readonly name: string;

  readonly allowDelete?: boolean;

  readonly closeHref: string;
  readonly membersHref: string;
  readonly onRename?: (newName: string) => void | Promise<void>;
  readonly onDelete?: () => void | Promise<void>;
} & Pick<ComponentProps<typeof ClosableModal>, 'Heading'>;

export const EditWorkspaceModal = ({
  name,

  allowDelete,

  closeHref,
  membersHref,
  onRename = noop,
  onDelete = noop,

  ...props
}: EditWorkspaceModalProps): ReturnType<React.FC> => {
  const [newName, setNewName] = useState(name);
  const [deletionConfirmationPrompt, setDeletionConfirmationPrompt] =
    useState('');
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const membersEnabled = isFlagEnabled('WORKSPACE_MEMBERS');

  const renameWorkspace = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
        await onRename(newName);
      } finally {
        setIsSubmitting(false);
      }
    },
    [setIsSubmitting, onRename, newName]
  );

  const deleteWorkspace = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
        await onDelete();
      } finally {
        setIsSubmitting(false);
      }
    },
    [setIsSubmitting, onDelete]
  );

  return (
    <ClosableModal
      {...props}
      title="Workspace settings"
      closeAction={closeHref}
    >
      <div css={modalStyles}>
        <form css={formStyles} onSubmit={renameWorkspace}>
          <h3 css={headingStyles}>Rename Workspace</h3>
          <InputField
            required
            placeholder="My Renamed Workspace"
            value={newName}
            onChange={setNewName}
          />
          <Button
            type="secondary"
            submit
            disabled={!newName || newName === name || isSubmitting}
          >
            Rename
          </Button>
        </form>
        {membersEnabled && (
          <div css={membersStyle}>
            <h3 css={headingStyles}>Workspace members</h3>
            <Button type="secondary" href={membersHref}>
              <span css={buttonIconStyle}>
                <People />
              </span>
              Manage members
            </Button>
          </div>
        )}
        {allowDelete && (
          <form css={formStyles} onSubmit={deleteWorkspace}>
            <h3 css={headingStyles}>Delete Workspace</h3>
            <p css={css(p13Regular)}>
              Are you sure you want to delete your workspace? This will also
              delete all of the notebooks associated with the workspace. Type
              the workspace name to confirm.
            </p>
            <InputField
              required
              placeholder="My Workspace Name"
              value={deletionConfirmationPrompt}
              onChange={setDeletionConfirmationPrompt}
            />
            <Button
              type="danger"
              submit
              disabled={deletionConfirmationPrompt !== name || isSubmitting}
            >
              Delete
            </Button>
          </form>
        )}
      </div>
    </ClosableModal>
  );
};

const headingStyles = css(
  p13Medium,
  setCssVar('currentTextColor', cssVar('weakTextColor'))
);

const modalStyles = css({
  display: 'grid',
  rowGap: '24px',
});

const membersStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  gap: '8px',
});

const buttonIconStyle = css({
  height: '18px',
  width: '18px',
  marginRight: '4px',
});

const formStyles = css({ display: 'grid', rowGap: '12px' });
