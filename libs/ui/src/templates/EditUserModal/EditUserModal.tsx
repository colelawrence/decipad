import { useSafeState } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ModalForm } from '../../molecules';
import { ClosableModal } from '../../organisms';
import { cssVar, p13Regular } from '../../primitives';

type EditUserModalProps = {
  readonly name: string;
  readonly onChangeName: (newName: string) => void;
  readonly username?: string;
  readonly onChangeUsername?: (newUsername: string) => void;
  readonly onClose: () => void;
};

export const EditUserModal = ({
  name,
  username,
  onClose,
  onChangeName = noop,
  onChangeUsername = noop,

  ...props
}: EditUserModalProps): ReturnType<React.FC> => {
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  return (
    <ClosableModal
      Heading="h2"
      {...props}
      title="Account settings"
      closeAction={onClose}
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
