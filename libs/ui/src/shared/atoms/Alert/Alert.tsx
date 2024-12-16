import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { css } from '@emotion/react';
import { cssVar, p13Medium, p14Medium } from '../../../primitives';

import { Info, Warning } from '../../../icons';
import styled from '@emotion/styled';

const Icons = {
  error: Warning,
  info: Info,
  warning: Warning,
} as const;

export type AlertProps = {
  type?: 'error' | 'warning' | 'info';
  children: React.ReactNode;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const Alert: React.FC<AlertProps> = ({
  type = 'warning',
  children,
  ...props
}: AlertProps) => {
  const Icon = Icons[type];

  return (
    <AlertWrapper contentEditable={false} data-testid="alert" {...props}>
      {Icon && <Icon css={iconStyles} />}

      {typeof children === 'string' ? (
        <AlertDescription>{children}</AlertDescription>
      ) : (
        children
      )}
    </AlertWrapper>
  );
};

export const AlertTitle = styled.div({
  ...p14Medium,
  color: cssVar('textTitle'),
});

export const AlertDescription = styled.div({
  ...p13Medium,
});

const AlertWrapper = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'start',
  flexDirection: 'column',
  padding: '16px 40px 16px',
  gap: '8px',
  borderRadius: '8px',
  backgroundColor: cssVar('backgroundDefault'),
});

const iconStyles = css({
  position: 'absolute',
  left: 16,
  flexShrink: 0,
  width: 16,
  height: 16,
});
