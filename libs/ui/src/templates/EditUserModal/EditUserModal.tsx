import { useSafeState } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { create } from 'zustand';
import { useAccountSettingsState } from '@decipad/graphql-client';
import { useCallback } from 'react';
import { ClosableModal } from '../../organisms';
import { cssVar, p13Regular } from '../../primitives';
import { inputLabel } from '../../primitives/text';
import { Button } from '../../atoms';
import { ColorThemeSwitch } from '../../molecules/ColorThemeSwitch/ColorThemeSwitch';
import {
  AccountSettingsForm,
  serializeAccountSettingsForm,
} from '../../molecules/AccountSettingsForm/AccountSettingsForm';

type EditUserModalProps = {
  readonly name: string;
  readonly onChangeName: (newName: string) => Promise<void>;
  readonly username?: string;
  readonly onChangeUsername?: (newUsername: string) => Promise<void>;
  readonly description?: string;
  readonly onChangeDescription?: (newDescription: string) => Promise<void>;
};

export const useEditUserModalStore = create<{
  isOpened: boolean;
  open(): void;
  close(): void;
}>((set) => ({
  isOpened: false,
  open: () => set({ isOpened: true }),
  close: () => set({ isOpened: false }),
}));

const emptyPromise = Promise.resolve;

export const EditUserModal = ({
  name,
  username,
  description,
  onChangeName = emptyPromise,
  onChangeUsername = emptyPromise,
  onChangeDescription = emptyPromise,

  ...props
}: EditUserModalProps): ReturnType<React.FC> => {
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const isOpened = useEditUserModalStore((state) => state.isOpened);
  const closeModal = useEditUserModalStore((state) => state.close);

  const { currentUser } = useAccountSettingsState();

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const data = serializeAccountSettingsForm(form);

      if (currentUser.name !== data.name) {
        setIsSubmitting(true);
        await onChangeName(data.name);
        setIsSubmitting(false);
      }

      if (currentUser.username !== data.username) {
        setIsSubmitting(true);
        await onChangeUsername(data.username);
        setIsSubmitting(false);
      }

      closeModal();
    },
    [currentUser, setIsSubmitting, onChangeUsername, onChangeName, closeModal]
  );

  if (!isOpened) {
    return null;
  }

  return (
    <ClosableModal
      Heading="h2"
      {...props}
      title="Account settings"
      closeAction={closeModal}
    >
      <form css={{ display: 'grid', rowGap: '24px' }} onSubmit={handleSubmit}>
        <AccountSettingsForm currentUser={currentUser} />

        <div>
          <h3 css={inputLabel}>Profile picture</h3>
          <p css={css(p13Regular)}>
            If you want to setup your account avatar go to{' '}
            <a
              css={{
                color: cssVar('droplineColor'),
                textDecoration: 'underline',
              }}
              href="https://gravatar.com"
              target="_blank"
              rel="noreferrer"
            >
              Gravatar.com
            </a>{' '}
            to set it up.
          </p>
        </div>

        <div>
          <h3 css={inputLabel}>Color theme</h3>

          <p
            css={{
              padding: '8px',
              borderRadius: '4px',
            }}
          >
            <ColorThemeSwitch />
          </p>
        </div>

        <div css={createWorkspaceButtonStyle}>
          <Button
            submit
            type="primary"
            testId="btn-create-modal"
            disabled={!name || isSubmitting}
          >
            Save changes
          </Button>
          <Button type="secondary" onClick={closeModal}>
            Cancel
          </Button>
        </div>
      </form>
    </ClosableModal>
  );
};

const createWorkspaceButtonStyle = css({
  display: 'flex',
  gap: '8px',
  button: { flexGrow: 0 },
});
