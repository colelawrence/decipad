/* eslint decipad/css-prop-named-variable: 2 */
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { useSafeState } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useCallback, useState } from 'react';
import { Button, InputField, Modal } from '../../../shared';

type CreateWorkspaceModalProps = {
  readonly onClose: () => void;
  readonly onCreate?: (name: string) => void | Promise<void>;
};

export const CreateWorkspaceModal = ({
  onClose,
  onCreate = noop,
  ...props
}: CreateWorkspaceModalProps): ReturnType<React.FC> => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useSafeState(false);
  const { setIsUpgradeWorkspaceModalOpen } = useCurrentWorkspaceStore();

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
        await onCreate(name);
      } finally {
        setIsSubmitting(false);
        setIsUpgradeWorkspaceModalOpen(false);
      }
    },
    [name, onCreate, setIsSubmitting, setIsUpgradeWorkspaceModalOpen]
  );

  return (
    <Modal
      {...props}
      title="Create New Workspace"
      onClose={onClose}
      defaultOpen={true}
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
          <Button type="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
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
