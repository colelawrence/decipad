/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Close, ArrowBack2 } from '../../icons';
import { cssVar } from '../../primitives';
import { S } from './styles';
import { Button } from '../../shared';

export type IntegrationModalProps = Readonly<{
  children: ReactNode;

  // To be displayed at the top of the modal.
  title: string;

  // Close the panel.
  onClose?: () => void;
  onBack?: () => void;

  // Display above the run and back button to show some extra information.
  infoPanel: ReactNode;
}>;

export const WrapperIntegrationModalDialog: FC<IntegrationModalProps> = ({
  title,
  onClose,
  onBack,
  children,

  infoPanel,
}) => (
  <S.IntegrationWrapper data-testId="integration-wrapper">
    <S.CloseIconWrapper>
      <Button type="minimal" onClick={onBack}>
        <ArrowBack2 />
      </Button>
      <h2>{title}</h2>
      <span />
      <Button type="minimal" onClick={onClose}>
        <Close />
      </Button>
    </S.CloseIconWrapper>
    <div css={allChildrenStyles}>{children}</div>
    <section>{infoPanel}</section>
  </S.IntegrationWrapper>
);

const childrenStyles = css({
  width: '100%',
  flexGrow: 1,
  display: 'flex',
  gap: '8px',
  flexDirection: 'column',
  '& > span': {
    flexGrow: 1,
  },
  '& > label:not(:first-of-type)': {
    paddingTop: '8px',
  },
  '& > button': {
    padding: '7px 0',
  },
});

const mapChildrenStyles = css({
  overflow: 'auto',
  height: '100%',
});

export const dividerStyles = css({
  width: '100%',
  border: `1px solid ${cssVar('backgroundDefault')}`,
  borderRadius: '4px',
});

const allChildrenStyles = css(childrenStyles, mapChildrenStyles);
