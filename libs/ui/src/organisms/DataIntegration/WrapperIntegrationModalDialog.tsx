/* eslint decipad/css-prop-named-variable: 0 */
import {
  ExecutionContext,
  useCodeConnectionStore,
  useConnectionStore,
} from '@decipad/react-contexts';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useWorkspaceSecrets } from '@decipad/graphql-client';
import {
  removeFocusFromAllBecauseSlate,
  useEnterListener,
} from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, useContext } from 'react';
import { Button, TextAndIconButton } from '../../atoms';
import { Close, Play, Sparkles } from '../../icons';
import { Tabs } from '../../molecules/Tabs/Tabs';
import { cssVar, p15Medium, p16Medium } from '../../primitives';
import { closeButtonStyles } from '../../styles/buttons';

type Stages =
  | 'pick-integration'
  | 'connect'
  | 'create-query'
  | 'settings'
  | 'map';

interface WrapperIntegrationModalDialogProps {
  readonly children: ReactNode;

  readonly title: string;
  readonly workspaceId?: string;

  readonly showTabs: boolean;
  readonly tabStage?: Stages;
  readonly onTabClick?: (s: Stages) => void;

  readonly onBack: () => void;
  readonly onReset?: () => void;
  readonly onContinue: () => void;
  readonly setOpen: (open: boolean) => void;

  readonly isEditing?: boolean;

  readonly secretsMenu: ReactNode;
}

export const WrapperIntegrationModalDialog: FC<
  WrapperIntegrationModalDialogProps
> = ({
  title,
  onContinue: onConnect,
  onBack: onAbort,
  onReset = noop,
  showTabs = false,
  tabStage = 'pick-source' as Stages,
  onTabClick = noop,
  setOpen = noop,
  isEditing = false,
  children,
  workspaceId,

  secretsMenu,
}) => {
  const { onExecute } = useContext(ExecutionContext);
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

  let { secrets } = useWorkspaceSecrets(workspaceId || '');

  if (!secrets) {
    secrets = [];
  }

  const execSource = () => onExecute({ status: 'run' });

  useEnterListener(() => {
    switch (tabStage) {
      case 'connect':
        execSource();
        return;
      case 'map':
        insertIntoNotebook();
    }
  });

  const tabs = (
    <Tabs variant>
      <TextAndIconButton
        key="tab-1"
        size="normal"
        text="Code"
        variantHover
        notSelectedLook={tabStage !== 'connect'}
        color={tabStage === 'connect' ? 'grey' : 'transparent'}
        onClick={() => onTabClick('connect')}
      />
      <TextAndIconButton
        key="tab-2"
        size="normal"
        text="Preview"
        variantHover
        notSelectedLook={tabStage !== 'map'}
        color={tabStage === 'map' ? 'grey' : 'transparent'}
        onClick={() => onTabClick('map')}
      />
      {false && (
        <TextAndIconButton
          key="tab-3"
          size="normal"
          text="Settings"
          variantHover
          notSelectedLook={tabStage !== 'settings'}
          color={tabStage === 'settings' ? 'grey' : 'transparent'}
          onClick={() => onTabClick('settings')}
        />
      )}
    </Tabs>
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
              {isFlagEnabled('CODE_INTEGRATIONS_AI_BUTTON') && showAiButton && (
                <TextAndIconButton
                  text="AI assistance"
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
              {secretsMenu}
              <TextAndIconButton
                text="Run"
                size="normal"
                iconPosition="left"
                color="brand"
                onClick={execSource}
              >
                <Play />
              </TextAndIconButton>
            </>
          )}
        </div>
      </div>
      <div css={allChildrenStyles(tabStage)}>{children}</div>
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
              <div css={connectStyles}>
                <Button
                  type={'primary'}
                  disabled={!hasDataPreview}
                  onClick={insertIntoNotebook}
                  testId={'integration-modal-continue'}
                >
                  {tabStage === 'map' ? 'Insert' : 'Continue'}
                </Button>
              </div>
              <div>
                <Button
                  type="secondary"
                  onClick={() => {
                    const AIPanelOpen = !showAiButton;
                    if (tabStage === 'map') {
                      onAbort();
                    } else if (tabStage === 'connect') {
                      if (AIPanelOpen) {
                        codeStore.toggleShowAi();
                      } else {
                        onReset();
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
        </div>
      )}
    </div>
  );
};

const intWrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '740px',
  height: '632px',
  maxHeight: 'calc(100vh - 40px)',
  padding: '32px',
  gap: '20px',

  border: `1px solid ${cssVar('highlightColor')}`,
  borderRadius: '24px',

  backgroundColor: cssVar('backgroundColor'),
});

const titleWrapperStyles = css(p15Medium, {
  color: cssVar('normalTextColor'),
  height: '30px',

  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'end',
});

const titleStyles = css([
  p16Medium,
  {
    color: cssVar('strongTextColor'),
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
  border: `1px solid ${cssVar('highlightColor')}`,
  borderRadius: '4px',
});

const bottomBarStyles = css({
  width: '100%',
  justifyContent: 'flex-start',
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
