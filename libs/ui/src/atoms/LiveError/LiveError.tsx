/* eslint decipad/css-prop-named-variable: 0 */
import { isFlagEnabled } from '@decipad/feature-flags';
import { noop } from '@decipad/utils';
import { ComponentProps, FC } from 'react';
import { CodeError } from '../CodeError/CodeError';
import { TextAndIconButton } from '../TextAndIconButton/TextAndIconButton';
import { Tooltip } from '../Tooltip/Tooltip';
import { GoogleConnectButton } from '@decipad/ui';
import { Refresh } from '../../icons';

interface LiveErrorProps {
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
  const isFailedAuth =
    isFlagEnabled('INTEGRATIONS_AUTH') && isPermissionError(error);

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

  const button = isPermissionError(error) ? (
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

  return isFailedAuth ? (
    <Tooltip hoverOnly trigger={button}>
      Sorry, we can't access your private document right now. We are waiting for
      google to approve our app.
    </Tooltip>
  ) : (
    button
  );
};
