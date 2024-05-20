/* eslint decipad/css-prop-named-variable: 0 */
import {
  useCodeConnectionStore,
  useConnectionStore,
} from '@decipad/react-contexts';
import {
  removeFocusFromAllBecauseSlate,
  useEnterListener,
} from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Close, Sparkles, Play } from '../../icons';
import {
  cssVar,
  mobileQuery,
  p15Medium,
  p16Medium,
  smallestMobile,
} from '../../primitives';
import { closeButtonStyles } from '../../styles/buttons';
import {
  Button,
  TextAndIconButton,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '../../shared';

type Stages = 'pick-integration' | 'connect' | 'map';

interface WrapperIntegrationModalDialogProps {
  readonly children: ReactNode;

  readonly title: string;

  readonly connectionTabLabel?: string;

  readonly showTabs: boolean;
  readonly tabStage?: Stages;
  readonly onTabClick?: (s: Stages) => void;

  readonly onBack: () => void;
  readonly onReset?: () => void;
  readonly onContinue: () => void;
  readonly onRun: () => void;

  readonly setOpen: (open: boolean) => void;

  readonly isEditing?: boolean;

  // REFACTOR: Remove this.
  readonly isCode: boolean;

  readonly hideRunButton?: boolean;

  readonly disableRunButton?: boolean;

  /**
   * Display custom react component to perform some actions
   */
  readonly actionMenu: ReactNode;

  /**
   * Display above the run and back button to show some extra information.
   */
  readonly infoPanel: ReactNode;
}

export const WrapperIntegrationModalDialog: FC<
  WrapperIntegrationModalDialogProps
  // eslint-disable-next-line complexity
> = ({
  title,
  onContinue: onConnect,
  onBack: onAbort,
  onReset = noop,
  showTabs = false,
  tabStage = 'pick-source' as Stages,
  onTabClick = noop,
  setOpen = noop,
  onRun,
  isEditing = false,
  children,
  isCode,
  connectionTabLabel = 'Code',

  hideRunButton = false,
  disableRunButton = false,

  actionMenu,
  infoPanel,
}) => {
  const { resultPreview, stage, connectionType } = useConnectionStore();
  const codeStore = useCodeConnectionStore();
  const hasDataPreview = !!resultPreview;

  const showAiButton =
    stage === 'connect' &&
    connectionType === 'codeconnection' &&
    !codeStore.showAi;

  const insertIntoNotebook = () => {
    onConnect();
    removeFocusFromAllBecauseSlate();
  };

  useEnterListener(() => {
    switch (tabStage) {
      case 'connect':
        onRun();
        return;
      case 'map':
        insertIntoNotebook();
    }
  });

  const tabs = (
    <TabsRoot
      defaultValue={tabStage}
      onValueChange={(newValue) => {
        onTabClick(newValue as Stages);
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

  return (
    <div css={intWrapperStyles}>
      <div css={titleWrapperStyles}>
        <div css={titleStyles}>{title}</div>
        <div css={iconStyles}>
          <div
            role="button"
            css={closeButtonStyles}
            onClick={() => setOpen(false)}
          >
            <Close />
          </div>
        </div>
      </div>
      <div css={tabsBarStyles}>
        <div>{showTabs && tabs}</div>
        <div css={rightButtonsContainerStyles}>
          {tabStage === 'connect' && (
            <>
              {showAiButton && (
                <TextAndIconButton
                  text="AI"
                  size="normal"
                  iconPosition="left"
                  color="transparent-green"
                  onClick={() => {
                    codeStore.toggleShowAi();
                  }}
                >
                  <Sparkles />
                </TextAndIconButton>
              )}
            </>
          )}
          {actionMenu}
        </div>
      </div>
      <div css={allChildrenStyles(tabStage)}>{children}</div>
      <section>{infoPanel}</section>
      {showTabs && (
        <div css={bottomBarStyles}>
          {isEditing ? (
            <div css={connectStyles}>
              <Button
                type={'primary'}
                disabled={!hasDataPreview}
                onClick={insertIntoNotebook}
              >
                Save
              </Button>
            </div>
          ) : (
            <>
              <div css={[connectStyles, buttonWrapperStyles]}>
                <Button
                  type={'primary'}
                  disabled={!hasDataPreview}
                  onClick={insertIntoNotebook}
                  testId={'integration-modal-continue'}
                >
                  {tabStage === 'map' ? 'Insert' : 'Continue'}
                </Button>
              </div>
              <div css={buttonWrapperStyles}>
                <Button
                  type="tertiaryAlt"
                  onClick={() => {
                    const AIPanelOpen = !showAiButton;
                    if (tabStage === 'map') {
                      onAbort();
                    } else if (tabStage === 'connect') {
                      if (AIPanelOpen && isCode) {
                        codeStore.toggleShowAi();
                      } else if (isCode) {
                        onReset();
                      } else {
                        onAbort();
                      }
                    }
                  }}
                >
                  {tabStage === 'map' ||
                  (tabStage === 'connect' && !showAiButton)
                    ? 'Back'
                    : 'Reset'}
                </Button>
              </div>
            </>
          )}
          {!hideRunButton && (
            <TextAndIconButton
              text="Run"
              size="normal"
              iconPosition="left"
              color="brand"
              onClick={onRun}
              disabled={disableRunButton}
            >
              <Play />
            </TextAndIconButton>
          )}
        </div>
      )}
    </div>
  );
};

const buttonWrapperStyles = css({
  button: {
    height: '32px',
  },
});

const intWrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '740px',
  height: '662px',
  maxHeight: 'calc(100vh - 40px)',
  padding: '32px',
  gap: '20px',

  border: `1px solid ${cssVar('backgroundDefault')}`,
  borderRadius: '24px',

  backgroundColor: cssVar('backgroundMain'),
  [mobileQuery]: { width: smallestMobile.landscape.width },

  section: {
    width: '100%',
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

const iconStyles = css({
  marginLeft: 'auto',

  height: '30px',
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',

  div: {
    width: '16px',
    height: '16px',
  },
});

const childrenStyles = css({
  width: '100%',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
});

const firstChildrenStyle = css({});

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

const rightButtonsContainerStyles = css({
  display: 'flex',
  gap: 10,
  alignItems: 'center',
});

const allChildrenStyles = (tabStage: string) =>
  css(
    childrenStyles,
    tabStage === 'connect' && firstChildrenStyle,
    tabStage === 'map' && mapChildrenStyles
  );
