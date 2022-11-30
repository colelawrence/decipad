import { useSafeState } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, useState } from 'react';
import { Button, InputField } from '../../atoms';
import { ClosableModal } from '../../organisms';
import { cssVar, p13Medium, p13Regular, setCssVar } from '../../primitives';

type EditWorkspaceModalProps = {
  readonly name: string;

  readonly allowDelete?: boolean;

  readonly closeHref: string;
  readonly onRename?: (newName: string) => void | Promise<void>;
  readonly onDelete?: () => void | Promise<void>;
} & Pick<ComponentProps<typeof ClosableModal>, 'Heading'>;

export const EditWorkspaceModal = ({
  name,

  allowDelete,

  closeHref,
  onRename = noop,
  onDelete = noop,

  ...props
}: EditWorkspaceModalProps): ReturnType<React.FC> => {
  const [newName, setNewName] = useState(name);
  const [deletionConfirmationPrompt, setDeletionConfirmationPrompt] =
    useState('');
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  return (
    <ClosableModal
      {...props}
      title={`${name} Preferences`}
      closeAction={closeHref}
    >
      <div css={{ display: 'grid', rowGap: '24px' }}>
        <form
          css={{ display: 'grid', rowGap: '12px' }}
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSubmitting(true);
            try {
              await onRename(newName);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
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
        {allowDelete && (
          <form
            css={{ display: 'grid', rowGap: '12px' }}
            onSubmit={async (event) => {
              event.preventDefault();
              setIsSubmitting(true);
              try {
                await onDelete();
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
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
