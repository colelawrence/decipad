import { useSafeState } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, useState } from 'react';
import { Button, InputField } from '../../atoms';
import { ClosableModal } from '../../organisms';
import { p16Regular } from '../../primitives';
import { nextHeading } from '../../utils';

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

  const Subheading = nextHeading[props.Heading];

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
          <Subheading>Rename Workspace</Subheading>
          <InputField
            required
            placeholder="My Renamed Workspace"
            value={newName}
            onChange={setNewName}
          />
          <Button
            primary
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
            <Subheading>Delete Workspace</Subheading>
            <p css={css(p16Regular)}>
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
