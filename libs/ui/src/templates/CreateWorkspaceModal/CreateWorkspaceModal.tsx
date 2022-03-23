import { useSafeState } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { ComponentProps, useState } from 'react';
import { Button, InputField } from '../../atoms';
import { ClosableModal } from '../../organisms';

type CreateWorkspaceModalProps = {
  readonly closeHref: string;
  readonly onCreate?: (name: string) => void | Promise<void>;
} & Pick<ComponentProps<typeof ClosableModal>, 'Heading'>;

export const CreateWorkspaceModal = ({
  closeHref,
  onCreate = noop,
  ...props
}: CreateWorkspaceModalProps): ReturnType<React.FC> => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  return (
    <ClosableModal
      {...props}
      title="Create New Workspace"
      closeAction={closeHref}
    >
      <form
        css={{ display: 'grid', rowGap: '12px' }}
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          try {
            await onCreate(name);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <InputField
          required
          placeholder="My Workspace"
          value={name}
          onChange={setName}
        />
        <Button type="secondary" submit disabled={!name || isSubmitting}>
          Create Workspace
        </Button>
      </form>
    </ClosableModal>
  );
};
