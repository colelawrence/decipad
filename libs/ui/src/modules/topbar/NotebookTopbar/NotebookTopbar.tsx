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

const ReaderTopbar: FC<TopbarGenericProps> = ({
  access,
  actions,
  status,
  authors,
  NotebookOptions,
  UndoButtons,
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
        </Styled.LeftContainer>

        <Styled.RightContainer>
          <ReadOnlyWriting />
          <NotebookAuthors {...authors} />
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
          {AiModeSwitch}
        </Styled.LeftContainer>
        <Styled.RightContainer>
          <Templates {...actions} />
          <Help />
          <SidebarToggle {...actions} />
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
          <GeneratedByAi />
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
    case 'READ': {
      if (props.access.hasWorkspaceAccess) {
        return <ReaderTopbar {...props} />;
      }
      return <NoAccessReaderTopbar {...props} />;
    }
    case 'WRITE':
    case 'ADMIN':
      return <WriterTopbar {...props} />;
  }
};
