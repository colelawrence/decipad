/* eslint decipad/css-prop-named-variable: 2 */
import { useSafeState } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, useCallback, useState } from 'react';
import { Button, InputField } from '../../atoms';
import { ClosableModal } from '../../organisms';
import { ClosableModalHeader } from '../../molecules';

type CreateWorkspaceModalProps = {
  readonly closeHref: string;
  readonly onCreate?: (name: string) => void | Promise<void>;
} & Pick<ComponentProps<typeof ClosableModalHeader>, 'Heading'>;

export const CreateWorkspaceModal = ({
  closeHref,
  onCreate = noop,
  ...props
}: CreateWorkspaceModalProps): ReturnType<React.FC> => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
        await onCreate(name);
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, onCreate, setIsSubmitting]
  );

  return (
    <ClosableModal
      {...props}
      title="Create New Workspace"
      closeAction={closeHref}
    >
      <form css={formWrapperStyle} onSubmit={handleSubmit}>
        <InputField
          size="small"
          required
          placeholder="Team workspace"
          label="Name of Workspace"
          value={name}
          onChange={setName}
        />
        <div css={createWorkspaceButtonStyle}>
          <Button
            submit
            type="primary"
            testId="btn-create-modal"
            disabled={!name || isSubmitting}
          >
            Create Workspace
          </Button>
          <Button type="secondary" href={closeHref}>
            Cancel
          </Button>
        </div>
      </form>
    </ClosableModal>
  );
};

const formWrapperStyle = css({
  display: 'grid',
  rowGap: '26px',
});

const createWorkspaceButtonStyle = css({
  display: 'flex',
  gap: '8px',
  button: { flexGrow: 0 },
});
