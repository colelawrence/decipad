/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { create } from 'zustand';
import {
  useAccountSettingsState,
  useAuthenticationState,
} from '@decipad/graphql-client';
import { useCallback } from 'react';

import { componentCssVars, p13Regular } from '../../../primitives';
import { inputLabel } from '../../../primitives/text';
import { Button, Link, ColorThemeSwitch, Modal } from '../../../shared';

import {
  AccountSettingsForm,
  serializeAccountSettingsForm,
} from '../AccountSettingsForm/AccountSettingsForm';
import { useSession } from 'next-auth/react';

export const useEditUserModalStore = create<{
  isOpened: boolean;
  open(): void;
  close(): void;
}>((set) => ({
  isOpened: false,
  open: () => set({ isOpened: true }),
  close: () => set({ isOpened: false }),
}));

export const EditUserModal: React.FC = () => {
  const { update } = useSession();
  const isOpened = useEditUserModalStore((state) => state.isOpened);
  const closeModal = useEditUserModalStore((state) => state.close);

  const { signOutCallback } = useAuthenticationState();
  const { currentUser, setName, setUsername, isSubmitting } =
    useAccountSettingsState();
  const { name, username } = currentUser;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      let isSuccessful = true;
      const form = event.target as HTMLFormElement;
      const data = serializeAccountSettingsForm(form);

      if (name !== data.name) {
        isSuccessful = isSuccessful && (await setName(data.name));
      }

      if (username !== data.username) {
        isSuccessful = isSuccessful && (await setUsername(data.username));
      }

      if (isSuccessful) {
        await update();
        closeModal();
      }
    },
    [name, username, setUsername, setName, closeModal, update]
  );

  if (!isOpened) {
    return null;
  }

  return (
    <Modal
      title="Account settings"
      onClose={closeModal}
      size="sm"
      defaultOpen={true}
    >
      <form css={{ display: 'grid', rowGap: '24px' }} onSubmit={handleSubmit}>
        <AccountSettingsForm currentUser={currentUser} />

        <div>
          <h3 css={inputLabel}>Profile picture</h3>
          <p css={css(p13Regular)}>
            Please upload and manage your avatar at{' '}
            <a
              css={{
                color: componentCssVars('DroplineColor'),
                textDecoration: 'underline',
              }}
              href="https://gravatar.com"
              target="_blank"
              rel="noreferrer"
            >
              Gravatar.com
            </a>
            .
          </p>
        </div>

        <div>
          <h3 css={inputLabel}>Color theme</h3>

          <p css={colorSwitchContainerStyle}>
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
          <Button type="tertiaryAlt" onClick={closeModal}>
            Cancel
          </Button>

          <div css={spacerStyle} />

          <Link
            noUnderline
            color="danger"
            onClick={signOutCallback}
            data-testid="logout-link"
          >
            Log out
          </Link>
        </div>
      </form>
    </Modal>
  );
};

const colorSwitchContainerStyle = css({
  padding: '8px',
  borderRadius: '4px',
});

const createWorkspaceButtonStyle = css({
  display: 'flex',
  gap: '8px',
  button: { flexGrow: 0 },
  alignItems: 'center',
});

const spacerStyle = css({ flex: 1 });
