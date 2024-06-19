/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Close } from '../../icons';
import { cssVar, p15Medium, p16Medium } from '../../primitives';
import { Button, TabsList, TabsRoot, TabsTrigger } from '../../shared';
import { S } from './styles';

type Stages = 'pick-integration' | 'connect' | 'map';

type WithTabs = Readonly<{
  // Short human readable type of the integration.
  connectionTabLabel: string;

  tabStage: Stages;
  onTabClick: (_: Stages) => void;
}>;

type IntegrationModalProps = Readonly<{
  children: ReactNode;

  // To be displayed at the top of the modal.
  title: string;

  // Hide tabs if this is undefined
  tabs?: WithTabs;

  // Control buttons.
  onBack: () => void;
  onContinue: () => void;

  // Close the panel.
  onClose: () => void;

  // Display above the run and back button to show some extra information.
  infoPanel: ReactNode;
}>;

const IntegrationTabs: FC<WithTabs> = ({
  tabStage,
  onTabClick,
  connectionTabLabel,
}) => (
  <TabsRoot
    defaultValue={tabStage}
    onValueChange={(newValue) => {
      onTabClick(newValue);
    }}
  >
    <TabsList>
      <TabsTrigger
        name="connect"
        trigger={{
          label: connectionTabLabel,
          disabled: false,
        }}
      />
      <TabsTrigger
        name="map"
        trigger={{
          label: 'Preview',
          disabled: false,
        }}
      />
    </TabsList>
  </TabsRoot>
);

export const WrapperIntegrationModalDialog: FC<IntegrationModalProps> = ({
  title,
  onContinue,
  onBack,
  onClose,
  children,

  tabs,
  infoPanel,
}) => (
  <S.IntegrationWrapper data-testId="integration-wrapper">
    <div css={titleWrapperStyles}>
      <div css={titleStyles}>{title}</div>

      <S.CloseIconWrapper>
        <div role="button" onClick={onClose}>
          <Close />
        </div>
      </S.CloseIconWrapper>
    </div>
    {tabs != null && (
      <div css={tabsBarStyles}>
        <IntegrationTabs {...tabs} />
      </div>
    )}
    <div css={allChildrenStyles}>{children}</div>
    <section>{infoPanel}</section>
    <div css={bottomBarStyles}>
      <div css={[connectStyles, buttonWrapperStyles]}>
        <Button
          type={'primary'}
          disabled={false /* TODO */}
          onClick={onContinue}
          testId="integration-modal-continue"
        >
          Continue
        </Button>
      </div>
      <div css={buttonWrapperStyles}>
        <Button type="tertiaryAlt" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  </S.IntegrationWrapper>
);

const buttonWrapperStyles = css({
  button: {
    height: '32px',
  },
});

const titleWrapperStyles = css(p15Medium, {
  color: cssVar('textDefault'),
  height: '30px',

  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'end',
});

const titleStyles = css([
  p16Medium,
  {
    color: cssVar('textHeavy'),
    lineHeight: '30px',
    flexShrink: 0,
    paddingLeft: '5px',
    paddingRight: '15px',
  },
]);

const childrenStyles = css({
  width: '100%',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
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

const bottomBarStyles = css({
  width: '100%',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginTop: 'auto',
  display: 'flex',
  gap: '8px',
});

const connectStyles = css({
  display: 'flex',
  gap: '20px',
});

const tabsBarStyles = css({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const allChildrenStyles = css(childrenStyles, mapChildrenStyles);
