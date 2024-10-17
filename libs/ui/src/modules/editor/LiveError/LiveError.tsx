/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { ComponentProps, FC } from 'react';
import { CodeError } from '../CodeError/CodeError';
import { TextAndIconButton } from '../../../shared/atoms/TextAndIconButton/TextAndIconButton';
import { Refresh } from '../../../icons';
import { GoogleConnectButton } from '../GoogleConnectButton/GoogleConnectButton';

export interface LiveErrorProps {
  error: Error;
  errorURL?: string;
  onRetry?: () => void;
  onAuthenticate?: () => void;
}

type IconInfo = Pick<ComponentProps<typeof TextAndIconButton>, 'color'> & {
  icon: React.ReactNode;
};

interface ErrorIcons {
  [key: string]: IconInfo;
}

const errorIcons: ErrorIcons = {
  'Could not find the result': {
    icon: (
      <CodeError
        message={"We don't support importing this block type yet"}
        url={'/docs/'}
        variant="smol"
      />
    ),
    color: 'red',
  },
  'Failed to fetch': {
    icon: <Refresh />,
    color: 'default',
  },
  'connect ENETUNREACH 2': {
    icon: (
      <CodeError
        message={"We don't support importing this block type yet"}
        url={'/docs/'}
        variant="smol"
      />
    ),
    color: 'default',
  },
};

const permissionDeniedMessageMatchers = ['permission', 'auth', 'forbidden'];

const isPermissionError = (err: Error): boolean => {
  const message = err.message.toLocaleLowerCase();
  return !!permissionDeniedMessageMatchers.find((matcher) =>
    message.includes(matcher)
  );
};

export const LiveError: FC<LiveErrorProps> = ({
  error,
  errorURL = '/docs/',
  onRetry = noop,
  onAuthenticate = noop,
}) => {
  const isFailedAuth = isPermissionError(error);

  const action = isFailedAuth ? onAuthenticate : onRetry;

  const defaultError = (
    <CodeError
      message={error.message || "There's an error in the source document"}
      defaultDocsMessage={'Go to source'}
      url={errorURL}
      variant="smol"
    />
  );
  const errorMessage = error.message || '';

  const specialErrors = Object.keys(errorIcons);

  const matchError = specialErrors.find((m) => errorMessage.includes(m));

  const { icon, color } = matchError
    ? errorIcons[matchError]
    : ({
        icon: defaultError,
        color: 'red',
      } as IconInfo);

  return isPermissionError(error) ? (
    <GoogleConnectButton onClick={action} />
  ) : (
    <TextAndIconButton
      color={color}
      iconPosition="left"
      text="Retry"
      onClick={action}
      animateIcon={!isFailedAuth}
      disabled={isFailedAuth}
    >
      {icon}
    </TextAndIconButton>
  );
};
