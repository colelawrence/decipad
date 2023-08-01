/* eslint decipad/css-prop-named-variable: 0 */
import { WARNING_CREDITS_LEFT_PERCENTAGE } from '@decipad/editor-types';
import {
  useIncrementQueryCountMutation,
  useWorkspaceSecrets,
} from '@decipad/graphql-client';
import {
  ExecutionContext,
  useCodeConnectionStore,
  useConnectionStore,
  useCurrentWorkspaceStore,
} from '@decipad/react-contexts';
import {
  removeFocusFromAllBecauseSlate,
  useEnterListener,
} from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Button, TextAndIconButton, UpgradePlanWarning } from '../../atoms';
import { Close, Play, Sparkles } from '../../icons';
import { Tabs } from '../../molecules/Tabs/Tabs';
import {
  cssVar,
  mobileQuery,
  p13Regular,
  p15Medium,
  p16Medium,
  smallestMobile,
} from '../../primitives';
import { closeButtonStyles } from '../../styles/buttons';

type Stages = 'pick-integration' | 'connect' | 'map';

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

  // REFACTOR: Remove this.
  readonly isCode: boolean;

  /** Display custom react component to perform some actions
   * Currently being used for SecretsMenu or ConnectionsMenu
   */
  readonly actionMenu: ReactNode;
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
  isCode,

  actionMenu,
}) => {
  const { onExecute } = useContext(ExecutionContext);
  const { resultPreview, stage, connectionType } = useConnectionStore();
  const codeStore = useCodeConnectionStore();
  const hasDataPreview = !!resultPreview;
  const { workspaceInfo, setCurrentWorkspaceInfo } = useCurrentWorkspaceStore();
  const { quotaLimit, queryCount } = workspaceInfo;
  const [maxQueryExecution, setMaxQueryExecution] = useState(
    !!quotaLimit && !!queryCount && quotaLimit <= queryCount
  );
  const [runButtonDisabled, setRunButtonDisabled] = useState(maxQueryExecution);
  const [, updateQueryExecCount] = useIncrementQueryCountMutation();
  const [nrQueriesLeft, setNrQueriesLeft] = useState(
    quotaLimit && queryCount ? quotaLimit - queryCount : null
  );
  const [showQueryQuotaLimit, setShowQueryQuotaLimit] = useState(
    !!nrQueriesLeft &&
      !!quotaLimit &&
      nrQueriesLeft > 0 &&
      nrQueriesLeft <= quotaLimit * WARNING_CREDITS_LEFT_PERCENTAGE
  );

  useEffect(() => {
    if (queryCount && quotaLimit) {
      setNrQueriesLeft(quotaLimit - queryCount);
      setShowQueryQuotaLimit(
        !!nrQueriesLeft &&
          nrQueriesLeft <= quotaLimit * WARNING_CREDITS_LEFT_PERCENTAGE &&
          nrQueriesLeft > 0
      );
      setMaxQueryExecution(quotaLimit <= queryCount);
    }
  }, [quotaLimit, queryCount, nrQueriesLeft]);

  const updateQueryExecutionCount = useCallback(async () => {
    return updateQueryExecCount({
      id: workspaceId || '',
    });
  }, [workspaceId, updateQueryExecCount]);

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

  const execSource = async () => {
    setRunButtonDisabled(true);
    const result = await updateQueryExecutionCount();

    const newExecutedQueryData = result.data?.incrementQueryCount;
    const errors = result.error?.graphQLErrors;
    const limitExceededError = errors?.find(
      (err) => err.extensions.code === 'LIMIT_EXCEEDED'
    );

    if (newExecutedQueryData) {
      onExecute({ status: 'run' });
      setCurrentWorkspaceInfo({
        ...workspaceInfo,
        queryCount: newExecutedQueryData.queryCount,
        quotaLimit: newExecutedQueryData.quotaLimit,
      });
      setRunButtonDisabled(false);
    } else if (limitExceededError) {
      setMaxQueryExecution(true);
      setRunButtonDisabled(true);
    } else {
      setRunButtonDisabled(false);
    }
  };

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
              {showAiButton && (
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
            </>
          )}
          {actionMenu}
        </div>
      </div>
      <div css={allChildrenStyles(tabStage)}>{children}</div>
      {(showQueryQuotaLimit || maxQueryExecution) &&
        workspaceId &&
        quotaLimit && (
          <UpgradePlanWarning
            workspaceId={workspaceId}
            showQueryQuotaLimit={showQueryQuotaLimit}
            maxQueryExecution={maxQueryExecution}
            quotaLimit={quotaLimit}
          />
        )}
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
                  type="secondary"
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
              {showQueryQuotaLimit && (
                <p css={queriesLeftStyles}>
                  {nrQueriesLeft} of {quotaLimit} credits left
                </p>
              )}
            </>
          )}
          <TextAndIconButton
            text="Run"
            size="normal"
            iconPosition="left"
            color="brand"
            onClick={execSource}
            disabled={runButtonDisabled}
          >
            <Play />
          </TextAndIconButton>
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

const queriesLeftStyles = css({
  ...p13Regular,
  paddingLeft: '5px',
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
