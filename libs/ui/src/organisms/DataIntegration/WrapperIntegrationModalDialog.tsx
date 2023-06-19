/* eslint decipad/css-prop-named-variable: 0 */
import { isFlagEnabled } from '@decipad/feature-flags';
import { useWorkspaceSecrets } from '@decipad/graphql-client';
import { ExecutionContext, useConnectionStore } from '@decipad/react-contexts';
import {
  removeFocusFromAllBecauseSlate,
  useEnterListener,
} from '@decipad/react-utils';
import { workspaces } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, MenuItem, TextAndIconButton } from '../../atoms';
import { ArrowDiagonalTopRight, Caret, Close, Play } from '../../icons';
import { MenuList } from '../../molecules';
import { Tabs } from '../../molecules/Tabs/Tabs';
import { cssVar, p13Medium, p15Medium, p16Medium } from '../../primitives';
import { closeButtonStyles } from '../../styles/buttons';
import { hideOnPrint } from '../../styles/editor-layout';

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
}) => {
  const { onExecute } = useContext(ExecutionContext);
  const { resultPreview } = useConnectionStore();
  const hasDataPreview = !!resultPreview;

  interface SecretInfo {
    readonly id: string;
    readonly name: string;
  }

  const [secretsOpen, setSecretsOpen] = useState(false);
  const [secret, setOrAddSecret] = useState<SecretInfo | undefined>();
  const navigate = useNavigate();
  const insertIntoNotebook = () => {
    onConnect();
    removeFocusFromAllBecauseSlate();
  };

  useEffect(() => {
    if (secret) onExecute({ status: 'secret', ...secret });
  }, [onExecute, secret]);

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
        <div css={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {tabStage === 'connect' && (
            <>
              {isFlagEnabled('SECRETS_IN_JS') && (
                <div css={css({ display: 'inline-block', cursor: 'pointer' })}>
                  <MenuList
                    root
                    dropdown
                    open={secretsOpen}
                    sideOffset={12}
                    onChangeOpen={setSecretsOpen}
                    trigger={
                      <span css={categoryAndCaretStyles}>
                        <span css={p13Medium}>
                          {/* Without text the icon has no line height, and so floats
                upwards, hence the non-breaking space */}
                          {'\uFEFF'}
                          Insert Secret
                        </span>
                        <span
                          css={{
                            width: 18,
                            display: 'grid',
                          }}
                          data-testid="insert-secret-button"
                        >
                          <Caret variant="down" />
                        </span>
                      </span>
                    }
                  >
                    {secrets.map((secretElem, i) => (
                      <MenuItem
                        key={`secret-${i}`}
                        onSelect={() => {
                          setOrAddSecret(secretElem);
                        }}
                      >
                        <span>{secretElem.name}</span>
                      </MenuItem>
                    ))}
                    {secrets.length > 0 && (
                      <div role="presentation" css={hrStyles}>
                        <Divider />
                      </div>
                    )}

                    <MenuItem
                      icon={<ArrowDiagonalTopRight />}
                      onSelect={() => {
                        if (workspaceId) {
                          navigate(
                            workspaces({})
                              .workspace({
                                workspaceId,
                              })
                              .connections({}).$,
                            { replace: true }
                          );
                        }
                      }}
                    >
                      <span>Integration Secrets</span>
                    </MenuItem>
                  </MenuList>
                </div>
              )}

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
              <Button type={'primary'} onClick={insertIntoNotebook}>
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
                  onClick={tabStage === 'map' ? onAbort : onReset}
                >
                  {tabStage === 'map' ? 'Back' : 'Reset'}
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
  height: '740px',
  maxHeight: '600px',
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

const allChildrenStyles = (tabStage: string) =>
  css(
    childrenStyles,
    tabStage === 'connect' && firstChildrenStyle,
    tabStage === 'map' && mapChildrenStyles
  );

const categoryAndCaretStyles = css([
  hideOnPrint,
  {
    width: '100%',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'space-between',
    paddingLeft: '8px',
  },
]);

const hrStyles = css({
  padding: '4px 0px',
  textOverflow: 'ellipsis',
  transform: 'translateX(0px)',
  width: '100%',
  hr: {
    boxShadow: `0 0 0 0.5px ${cssVar('borderColor')}`,
  },
});
