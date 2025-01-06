import { docs } from '@decipad/routing';
import { FC, memo, useMemo } from 'react';
import {
  Chat,
  Deci,
  Home,
  Show,
  SidebarRight,
  Templates,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from '../../../icons';
import {
  Button,
  HelpMenu,
  Link,
  SegmentButtons,
  Tooltip,
} from '../../../shared';

import { isFlagEnabled } from '@decipad/feature-flags';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { getStripePlanTitle, useStripePlans } from '@decipad/react-utils';
import { p13Bold } from '../../../primitives';
import { Anchor } from '../../../utils';
import { NotebookAvatars } from '../NotebookAvatars/NotebookAvatars';
import { NotebookPath } from '../NotebookPath/NotebookPath';
import { GeneratedByAi } from './GeneratedByAi';
import * as Styled from './styles';
import {
  AccessInfo,
  Authors,
  TopbarActions,
  TopbarGenericProps,
} from './types';

const TemplatesLink: FC<TopbarActions> = ({ onGalleryClick }) => (
  <Styled.TemplateWrapper>
    <em css={p13Bold}>
      <Anchor
        href="http://www.decipad.com/templates"
        // Analytics
        onClick={onGalleryClick}
      >
        <Styled.TemplatesText>
          <Templates />
          Templates
        </Styled.TemplatesText>
      </Anchor>
    </em>
  </Styled.TemplateWrapper>
);

const Help: FC = () => (
  <div>
    <HelpMenu
      discordUrl="http://discord.gg/decipad"
      docsUrl={docs({}).$}
      releaseUrl={docs({}).page({ name: 'releases' }).$}
    />
  </div>
);

const AIToggle: FC<TopbarActions> = ({ onToggleAI, isAiOpen }) => (
  <Styled.HiddenFromSmallScreens>
    <SegmentButtons
      variant="darker"
      buttons={[
        {
          children: (
            <Styled.SidebarToggleTrigger>
              <Sparkles />
            </Styled.SidebarToggleTrigger>
          ),
          onClick: onToggleAI,
          selected: isAiOpen,
          setWhiteBackgroundWhenSelected: true,
          tooltip: 'Open AI panel',
          testId: 'top-bar-ai',
        },
      ]}
    />
  </Styled.HiddenFromSmallScreens>
);

const SidebarToggle: FC<TopbarActions> = ({
  onToggleSidebar,
  isDefaultSidebarOpen,
}) => (
  <Styled.HiddenFromSmallScreens>
    <SegmentButtons
      variant="darker"
      buttons={[
        {
          children: (
            <Styled.SidebarToggleTrigger>
              <SidebarRight />
            </Styled.SidebarToggleTrigger>
          ),
          onClick: onToggleSidebar,
          selected: isDefaultSidebarOpen,
          setWhiteBackgroundWhenSelected: true,
          tooltip: 'Open default sidebar',
          testId: 'top-bar-sidebar',
        },
      ]}
    />
  </Styled.HiddenFromSmallScreens>
);

const CloseSidebar: FC<TopbarActions> = ({ closeSideBar, isSidebarClosed }) => (
  <Styled.HiddenFromSmallScreens>
    <SegmentButtons
      variant="darker"
      buttons={[
        {
          children: (
            <Styled.SidebarToggleTrigger>
              <ChevronRight />
            </Styled.SidebarToggleTrigger>
          ),
          onClick: closeSideBar,
          selected: isSidebarClosed,
          setWhiteBackgroundWhenSelected: true,
          tooltip: 'Close sidebar',
          testId: 'close-sidebar',
        },
      ]}
    />
  </Styled.HiddenFromSmallScreens>
);

const AnnotationsToggle: FC<TopbarActions> = ({
  onToggleAnnotations,
  isAnnotationsOpen,
}) => {
  return (
    <Styled.HiddenFromSmallScreens>
      <SegmentButtons
        variant="darker"
        buttons={[
          {
            children: (
              <Styled.SidebarToggleTrigger>
                <Chat />
              </Styled.SidebarToggleTrigger>
            ),
            onClick: onToggleAnnotations,
            selected: isAnnotationsOpen,
            tooltip: 'Show annotations',
            testId: 'top-bar-annotations',
          },
        ]}
      />
    </Styled.HiddenFromSmallScreens>
  );
};

const ReadOnlyWriting: FC = () => {
  return (
    <Styled.AuthorsWrapper>
      <Tooltip
        side="bottom"
        hoverOnly
        trigger={
          <Styled.ReadOnlyWritingTrigger>
            <Show />
            <span>You have view-only access</span>
          </Styled.ReadOnlyWritingTrigger>
        }
      >
        <Styled.ReadOnlyWritingWrapper>
          <p>Ask to edit</p>
          <p>Request permission to edit from workspace admin.</p>
        </Styled.ReadOnlyWritingWrapper>
      </Tooltip>
    </Styled.AuthorsWrapper>
  );
};

const WritingAuthors: FC<Authors> = ({ adminName }) => {
  const text = adminName ?? 'an admin';

  return (
    <Styled.AuthorsWrapper>
      <Tooltip
        side="bottom"
        hoverOnly
        trigger={
          <Styled.AuthorsTrigger>
            <Show />
          </Styled.AuthorsTrigger>
        }
      >
        {`Ask ${text} to change this`}
      </Tooltip>
      <Styled.SpanTinyPhoneHide>
        You are in reading mode
      </Styled.SpanTinyPhoneHide>
    </Styled.AuthorsWrapper>
  );
};

const NotebookAuthors: FC<Authors> = (props) => {
  if (props.invitedUsers.length === 0) return null;

  return <NotebookAvatars {...props} />;
};

const HomeButton: FC<AccessInfo & TopbarActions> = ({
  isSharedNotebook,
  hasWorkspaceAccess,
  onBack,
}) => {
  if (isSharedNotebook || hasWorkspaceAccess) {
    return (
      <SegmentButtons
        variant="darker"
        buttons={[
          {
            children: (
              <Styled.SidebarToggleTrigger>
                <Home />
              </Styled.SidebarToggleTrigger>
            ),
            onClick: onBack,
            tooltip: 'Back to workspace',
            testId: 'back-to-home',
          },
        ]}
      />
    );
  }
  return (
    <Link href="https://decipad.com">
      <Styled.IconWrap>
        <Deci role="img" aria-label="Deci Logo" />
      </Styled.IconWrap>
    </Link>
  );
};

const TryOrDuplicate: FC<TopbarActions & AccessInfo> = ({
  isAuthenticated,
  onTryDecipadClick,
  onDuplicateNotebook,
  isDuplicateAllowed,
}) => {
  // We are temporarily disabling the redirects, all access needs to be done via a booking link on our marketing website
  /*
  const href = `/?redirectAfterLogin=${encodeURIComponent(
    window.location.pathname
  )}`;
*/
  const href = 'https://www.decipad.com/request-access';

  if (isAuthenticated && !isDuplicateAllowed) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <Button
        type="primaryBrand"
        onClick={onDuplicateNotebook}
        testId="duplicate-button"
      >
        Duplicate Notebook
      </Button>
    );
  }

  return (
    <Button href={href} type="primaryBrand" onClick={onTryDecipadClick}>
      Try Decipad
    </Button>
  );
};

const GPTClaim: FC<AccessInfo & TopbarActions> = ({
  isAuthenticated,
  onClaimNotebook,
}) => {
  const href = `/?redirectAfterLogin=${encodeURIComponent(
    window.location.pathname
  )}`;

  if (isAuthenticated) {
    return (
      <Button type={'primaryBrand'} onClick={onClaimNotebook}>
        Claim notebook
      </Button>
    );
  }

  return (
    <Styled.GPTNotification>
      <p>
        <Anchor href={href}>Sign in to your Decipad account</Anchor> to continue
        editing and save your changes.
      </p>
    </Styled.GPTNotification>
  );
};

/**
 * A user who has no access to the notebook
 * but the notebook is public.
 */
const NoAccessReaderTopbar: FC<TopbarGenericProps> = ({
  actions,
  access,
  authors,
}) => {
  return (
    <Styled.DefaultTopbarWrapper>
      <Styled.InnerStyles>
        <Styled.LeftContainer>
          <Link target="_blank" rel="noreferrer" href="https://decipad.com">
            <Styled.IconWrap>
              <Deci />
            </Styled.IconWrap>
          </Link>

          <NotebookPath
            notebookName="Decipad — smart document"
            href="https://decipad.com"
          />
        </Styled.LeftContainer>
        <Styled.RightContainer>
          <WritingAuthors {...authors} />
          <NotebookAuthors {...authors} />
          <TryOrDuplicate {...actions} {...access} />
        </Styled.RightContainer>
      </Styled.InnerStyles>
    </Styled.DefaultTopbarWrapper>
  );
};

const ReaderTopbar: FC<TopbarGenericProps> = ({
  access,
  actions,
  authors,
  UndoButtons,
  notebookName,
}) => {
  return (
    <Styled.DefaultTopbarWrapper>
      <Styled.InnerStyles>
        <Styled.LeftContainer>
          <HomeButton {...access} {...actions} />
          <Styled.TitleContainer>
            <div data-testId="notebook-name-topbar">
              <NotebookPath concatName notebookName={notebookName} />
            </div>
          </Styled.TitleContainer>
          {UndoButtons}
        </Styled.LeftContainer>

        <Styled.RightContainer>
          <ReadOnlyWriting />
          <NotebookAuthors {...authors} />
          {isFlagEnabled('ENABLE_COMMENTS') && (
            <AnnotationsToggle {...actions} />
          )}
          <Help />
        </Styled.RightContainer>
      </Styled.InnerStyles>
    </Styled.DefaultTopbarWrapper>
  );
};

const EmbedTopbar: FC<TopbarGenericProps> = ({ UndoButtons }) => {
  return (
    <Styled.DefaultTopbarWrapper>
      <Styled.InnerStyles>
        <Styled.LeftContainer>
          <Link target="_blank" rel="noreferrer" href="https://decipad.com">
            <Styled.IconWrap>
              <Deci />
            </Styled.IconWrap>
          </Link>

          <NotebookPath
            notebookName="Decipad — smart document"
            href="https://decipad.com"
          />
        </Styled.LeftContainer>
        {UndoButtons}
      </Styled.InnerStyles>
    </Styled.DefaultTopbarWrapper>
  );
};

const WriterTopbar: FC<TopbarGenericProps> = ({
  NotebookOptions,
  UndoButtons,
  NotebookPublishing,
  access,
  actions,
  authors,
  notebookName,
  workspaceName,
  toggleNavBarVisibility,
  isNavBarVisible = true,
  shouldRenderNavigationSidebar = true,
}) => {
  const { workspaceInfo } = useCurrentWorkspaceStore();
  const plans = useStripePlans();
  const planTitle = useMemo(
    () =>
      getStripePlanTitle(plans, workspaceInfo.plan, workspaceInfo.isPremium),
    [plans, workspaceInfo.isPremium, workspaceInfo.plan]
  );

  return (
    <Styled.DefaultTopbarWrapper>
      <Styled.InnerStyles>
        <Styled.LeftContainer>
          <Styled.HideTabletScreen>
            {isNavBarVisible && shouldRenderNavigationSidebar && (
              <Styled.LeftSidebarContainer>
                <Styled.DeciLogo>
                  <Deci />
                </Styled.DeciLogo>
                <Styled.WorkspaceInfoContainer>
                  <Styled.WorkspaceNameContainer>
                    {workspaceName}
                  </Styled.WorkspaceNameContainer>
                  <div>
                    <Styled.WorkspaceMembersContainer>{`${
                      workspaceInfo.membersCount
                    } member${
                      Number(workspaceInfo.membersCount) > 1 ? 's' : ''
                    }`}</Styled.WorkspaceMembersContainer>
                    <Styled.Badge isPremium={!!workspaceInfo.isPremium}>
                      {planTitle}
                    </Styled.Badge>
                  </div>
                </Styled.WorkspaceInfoContainer>
                <Styled.CollapseExpandIconContainer
                  isNavBarVisible={isNavBarVisible}
                  role="button"
                  aria-label="Collapse navigation sidebar"
                  onClick={toggleNavBarVisibility}
                >
                  {isNavBarVisible ? <ChevronLeft /> : <ChevronRight />}
                </Styled.CollapseExpandIconContainer>
              </Styled.LeftSidebarContainer>
            )}
            {!isNavBarVisible && shouldRenderNavigationSidebar && (
              <Styled.CollapseExpandIconContainer
                isNavBarVisible={isNavBarVisible}
                role="button"
                aria-label="Expand navigation sidebar"
                onClick={toggleNavBarVisibility}
              >
                {isNavBarVisible ? <ChevronLeft /> : <ChevronRight />}
              </Styled.CollapseExpandIconContainer>
            )}
          </Styled.HideTabletScreen>
          <HomeButton {...access} {...actions} />
          <Styled.TitleContainer>
            <div data-testId="notebook-name-topbar">
              <NotebookPath concatName notebookName={notebookName} />
            </div>
          </Styled.TitleContainer>
          {UndoButtons}
          {NotebookOptions && (
            <Styled.EllipsisButtonContainer>
              {NotebookOptions}
            </Styled.EllipsisButtonContainer>
          )}
        </Styled.LeftContainer>
        <Styled.RightContainer>
          <TemplatesLink {...actions} />
          <Help />
          {isFlagEnabled('ENABLE_COMMENTS') && (
            <AnnotationsToggle {...actions} />
          )}
          <Styled.GroupIconsWrapper>
            <AIToggle {...actions} />
            <SidebarToggle {...actions} />
            <CloseSidebar {...actions} />
          </Styled.GroupIconsWrapper>
          <NotebookAuthors {...authors} />

          <Styled.HideSmallScreen>{NotebookPublishing}</Styled.HideSmallScreen>
        </Styled.RightContainer>
      </Styled.InnerStyles>
    </Styled.DefaultTopbarWrapper>
  );
};

const AiGeneratedTopbar: FC<TopbarGenericProps> = ({ access, actions }) => {
  return (
    <Styled.DefaultTopbarWrapper>
      <Styled.InnerStyles>
        <Styled.LeftContainer>
          <Link target="_blank" rel="noreferrer" href="https://decipad.com">
            <Styled.IconWrap>
              <Deci />
            </Styled.IconWrap>
          </Link>

          <NotebookPath
            notebookName="Decipad — smart document"
            href="https://decipad.com"
          />
        </Styled.LeftContainer>

        <Styled.RightContainer>
          <GeneratedByAi />
          <GPTClaim {...access} {...actions} />
        </Styled.RightContainer>
      </Styled.InnerStyles>
    </Styled.DefaultTopbarWrapper>
  );
};

export const NotebookTopbar: FC<TopbarGenericProps> = memo((props) => {
  if (props.access.isGPTGenerated) {
    return <AiGeneratedTopbar {...props} />;
  }

  if (props.isEmbed) {
    return <EmbedTopbar {...props} />;
  }

  switch (props.access.permissionType) {
    case undefined:
    case null: {
      return <NoAccessReaderTopbar {...props} />;
    }
    case 'READ': {
      return <ReaderTopbar {...props} />;
    }
    case 'WRITE':
    case 'ADMIN':
      return <WriterTopbar {...props} />;
  }
});
