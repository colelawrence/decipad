import { useSafeState } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { create } from 'zustand';
import { ModalForm } from '../../molecules';
import { ClosableModal } from '../../organisms';
import { cssVar, p13Regular } from '../../primitives';

type EditUserModalProps = {
  readonly name: string;
  readonly onChangeName: (newName: string) => void;
  readonly username?: string;
  readonly onChangeUsername?: (newUsername: string) => void;
  readonly description?: string;
  readonly onChangeDescription?: (newDescription: string) => void;
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

export const EditUserModal = ({
  name,
  username,
  description,
  onChangeName = noop,
  onChangeUsername = noop,
  onChangeDescription = noop,

  ...props
}: EditUserModalProps): ReturnType<React.FC> => {
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const isOpened = useEditUserModalStore((state) => state.isOpened);
  const closeModal = useEditUserModalStore((state) => state.close);

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
      <div css={{ display: 'grid', rowGap: '24px' }}>
        <ModalForm
          label={name}
          title="Name"
          onSubmit={onChangeName}
          isSubmitting={isSubmitting}
          placeholderLabel={'Aspen Vaccaro'}
          setIsSubmitting={setIsSubmitting}
        />
        <ModalForm
          label={username}
          title="Username"
          onSubmit={onChangeUsername}
          isSubmitting={isSubmitting}
          placeholderLabel={'@aspen'}
          setIsSubmitting={setIsSubmitting}
        />
        <ModalForm
          label={description}
          title="Description"
          onSubmit={onChangeDescription}
          isSubmitting={isSubmitting}
          placeholderLabel={'Share something about yourself'}
          setIsSubmitting={setIsSubmitting}
          multiline
        />
        <h3>Avatar</h3>
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
    </ClosableModal>
  );
};
