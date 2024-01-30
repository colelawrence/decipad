import { isFlagEnabled } from '@decipad/feature-flags';
import { docs } from '@decipad/routing';
import { FC } from 'react';
import {
  Button,
  IconButton,
  Link,
  SegmentButtons,
  Tooltip,
  HelpMenu,
} from '../../../shared';
import { Cards, Deci, LeftArrowShort, Show, SidebarOpen } from '../../../icons';

import { p13Bold } from '../../../primitives';
import { Anchor } from '../../../utils';
import * as Styled from './styles';
import { GeneratedByAi } from './GeneratedByAi';
import {
  AccessInfo,
  Authors,
  TopbarActions,
  TopbarGenericProps,
} from './types';
import { NotebookAvatars } from '../NotebookAvatars/NotebookAvatars';
import { NotebookPath } from '../NotebookPath/NotebookPath';

const Templates: FC<TopbarActions> = ({ onGalleryClick }) => (
  <Styled.TemplateWrapper>
    <em css={p13Bold}>
      <Anchor
        href="http://www.decipad.com/templates"
        // Analytics
        onClick={onGalleryClick}
      >
        <Styled.TemplatesText>
          <Cards />
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

const SidebarToggle: FC<TopbarActions> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => (
  <Styled.HiddenFromSmallScreens>
    <SegmentButtons
      variant="darker"
      buttons={[
        {
          children: (
            <Styled.SidebarToggleTrigger>
              <SidebarOpen />
            </Styled.SidebarToggleTrigger>
          ),
          onClick: onToggleSidebar,
          selected: isSidebarOpen,
          tooltip: 'Open the sidebar',
          testId: 'top-bar-sidebar',
        },
      ]}
    />
  </Styled.HiddenFromSmallScreens>
);

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

const BackButton: FC<AccessInfo & TopbarActions> = ({
  isSharedNotebook,
  hasWorkspaceAccess,
  onBack,
}) => {
  if (isSharedNotebook || hasWorkspaceAccess) {
    return (
      <Styled.IconWrap>
        <IconButton onClick={onBack} testId="go-to-workspace">
          <LeftArrowShort />
        </IconButton>
      </Styled.IconWrap>
    );
  }

  return (
    <Styled.IconWrap>
      <Link href="https://decipad.com">
        <Deci />
      </Link>
    </Styled.IconWrap>
  );
};

const TryOrDuplicate: FC<TopbarActions & AccessInfo> = ({
  isAuthenticated,
  onTryDecipadClick,
  onDuplicateNotebook,
}) => {
  const href = `/?redirectAfterLogin=${encodeURIComponent(
    window.location.pathname
  )}`;

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

const ReaderTopbar: FC<TopbarGenericProps> = ({ actions, access, authors }) => {
  return (
    <Styled.DefaultTopbarWrapper>
      <Styled.InnerStyles>
        <Styled.LeftContainer>
          <Styled.IconWrap>
            <Link target="_blank" rel="noreferrer" href="https://decipad.com">
              <Deci />
            </Link>
          </Styled.IconWrap>

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

const EmbedTopbar: FC<TopbarGenericProps> = ({ UndoButtons }) => {
  return (
    <Styled.DefaultTopbarWrapper>
      <Styled.InnerStyles>
        <Styled.LeftContainer>
          <Styled.IconWrap>
            <Link target="_blank" rel="noreferrer" href="https://decipad.com">
              <Deci />
            </Link>
          </Styled.IconWrap>

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
  AiModeSwitch,
  NotebookPublishing,
  access,
  actions,
  authors,
  status,
}) => {
  return (
    <Styled.DefaultTopbarWrapper>
      <Styled.InnerStyles>
        <Styled.LeftContainer>
          <BackButton {...access} {...actions} />
          <Styled.TitleContainer>
            {NotebookOptions}
            <Styled.Status data-testid="notebook-status">
              {status}
            </Styled.Status>
          </Styled.TitleContainer>
          {UndoButtons}
          {isFlagEnabled('AI_ASSISTANT_CHAT') && AiModeSwitch}
        </Styled.LeftContainer>
        <Styled.RightContainer>
          <Templates {...actions} />
          <Help />
          <SidebarToggle {...actions} />
          <NotebookAuthors {...authors} />
          {NotebookPublishing}
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
          <Styled.IconWrap>
            <Link target="_blank" rel="noreferrer" href="https://decipad.com">
              <Deci />
            </Link>
          </Styled.IconWrap>

          <NotebookPath
            notebookName="Decipad — smart document"
            href="https://decipad.com"
          />

          <GeneratedByAi />
        </Styled.LeftContainer>

        <Styled.RightContainer>
          <GPTClaim {...access} {...actions} />
        </Styled.RightContainer>
      </Styled.InnerStyles>
    </Styled.DefaultTopbarWrapper>
  );
};

export const NotebookTopbar: FC<TopbarGenericProps> = (props) => {
  if (props.access.isGPTGenerated) {
    return <AiGeneratedTopbar {...props} />;
  }

  if (props.isEmbed) {
    return <EmbedTopbar {...props} />;
  }

  switch (props.access.permissionType) {
    case undefined:
    case null:
    case 'READ':
      return <ReaderTopbar {...props} />;
    case 'WRITE':
    case 'ADMIN':
      return <WriterTopbar {...props} />;
  }
};
