import { isFlagEnabled } from '@decipad/feature-flags';
import { noop } from '@decipad/utils';
import { ComponentProps, FC } from 'react';
import * as icons from '../../icons';
import { CodeError } from '../CodeError/CodeError';
import { TextAndIconButton } from '../TextAndIconButton/TextAndIconButton';

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

const errIcons: ErrorIcons = {
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
    icon: <icons.Refresh />,
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
  console.error(error.message);
  const isPermissionErr = isPermissionError(error);
  const isFailedAuth = isFlagEnabled('INTEGRATIONS_AUTH') && isPermissionErr;
  const label = isFailedAuth ? 'Authenticate with google' : 'Retry';
  const action = isFailedAuth ? onAuthenticate : onRetry;

  const defaultErr = (
    <CodeError
      message={error.message || "There's an error in the source document"}
      defaultDocsMessage={'Go to source'}
      url={errorURL}
      variant="smol"
    />
  );
  const errMsg = error.message || '';
  const specialErrs = Object.keys(errIcons);
  const maybeMatchErr = specialErrs.find((thing) => errMsg.includes(thing));
  const { icon, color } = isPermissionErr
    ? ({ icon: <icons.Google />, color: 'default' } as IconInfo)
    : maybeMatchErr
    ? errIcons[maybeMatchErr]
    : ({
        icon: defaultErr,
        color: 'red',
      } as IconInfo);

  return (
    <TextAndIconButton
      color={color}
      iconPosition="left"
      text={label}
      onClick={action}
      animateIcon
    >
      {icon}
    </TextAndIconButton>
  );
};
