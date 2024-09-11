import { useActiveTabId } from '@decipad/editor-hooks';
import { GetNotebookMetaQuery } from '@decipad/graphql-client';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import { notebooks } from '@decipad/routing';
import { isServerSideRendering } from '@decipad/support';
import { css } from '@emotion/react';
import { Chat, Duplicate, LineChart, Trash } from 'libs/ui/src/icons';
import * as Popover from '@radix-ui/react-popover';
import {
  cssVar,
  p12Medium,
  p13Regular,
  p14Medium,
  p14Regular,
} from 'libs/ui/src/primitives';

import { FC } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { format, fromUnixTime } from 'date-fns';

type NotebookAliasesProps = {
  notebookId: string;
  notebookName: string;
  aliases: NonNullable<GetNotebookMetaQuery['getPadById']>['aliases'];
  onRemoveAlias: NotebookMetaActionsReturn['onRemoveAlias'];
};

const wrapperStyles = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  backgroundColor: cssVar('backgroundMain'),
  borderRadius: '16px',
  padding: '16px',
});

const headerStyles = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const titleStyles = css(p14Medium, {
  color: cssVar('textHeavy'),
});

const bodyStyles = css(p13Regular, {
  color: cssVar('textSubdued'),
});

const itemStyles = css({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
});

const nameStyles = css(p14Medium, {
  display: 'flex',
  flex: '0 0 50%',
  alignItems: 'center',
  gap: '4px',
  color: cssVar('textHeavy'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  '&:hover': {
    color: cssVar('textDefault'),
  },
});

const copyIconStyles = css({
  display: 'grid',
  height: '14px',
  width: '14px',
});

const actionContainerStyles = css({
  display: 'flex',
  gap: 4,
  alignItems: 'center',
});

const insightContainerStyles = css({
  display: 'flex',
  gap: 1,
  borderRadius: '6px',
  overflow: 'hidden',
});

const insightStyles = css(p12Medium, {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '5px 8px',
  backgroundColor: cssVar('backgroundDefault'),
  color: cssVar('textHeavy'),
  cursor: 'pointer',
});

const insightIconStyles = css({
  display: 'grid',
  height: '14px',
  width: '14px',
});

const deleteButtonStyles = css({
  display: 'grid',
  height: '24px',
  width: '24px',
  padding: '5px',
  borderRadius: '6px',
  backgroundColor: cssVar('backgroundDefault'),
  color: cssVar('textHeavy'),
  cursor: 'pointer',

  '&:hover': {
    color: cssVar('textDefault'),
  },
});

const dataPopoverStyles = css({
  width: 360,
  padding: '8px',
  backgroundColor: cssVar('backgroundMain'),
  borderRadius: '6px',
  color: cssVar('textHeavy'),
  border: `1px solid ${cssVar('borderDefault')}`,
});

const eventDataItemStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '8px 0',
  borderBottom: `1px solid ${cssVar('borderSubdued')}`,
});

const eventDataItemTitleStyles = css(p14Medium, {
  color: cssVar('textHeavy'),
  display: 'flex',
  gap: 4,
});

const eventDataItemDateStyles = css(p14Regular, {
  color: cssVar('textSubdued'),
});

const eventDataItemMetaStyles = css(p14Medium, {
  color: cssVar('textSubdued'),
});

export const NotebookAliases: FC<NotebookAliasesProps> = ({
  notebookId,
  notebookName,
  aliases,
  onRemoveAlias,
}) => {
  const activeTabId = useActiveTabId();

  const sidebarData = useNotebookMetaData((state) => ({
    toggleSidebar: state.toggleSidebar,
  }));

  const link = (aliasId: string) =>
    isServerSideRendering()
      ? ''
      : new URL(
          notebooks({}).notebook({
            notebook: { id: notebookId, name: notebookName },
            tab: activeTabId,
            alias: aliasId,
          }).$,
          window.location.origin
        ).toString();

  if (aliases.length === 0) {
    return null;
  }

  return (
    <div css={wrapperStyles}>
      <div css={headerStyles}>
        <p css={titleStyles}>Link analytics</p>
        <p css={bodyStyles}>
          Manage your created links, keep an eye on the interactions and
          insights generated from them.
        </p>
      </div>
      {aliases.map(({ alias, id, annotations, events }) => (
        <div key={id} css={itemStyles}>
          <CopyToClipboard text={link(id)}>
            <button css={nameStyles}>
              {alias}
              <span css={copyIconStyles}>
                <Duplicate />
              </span>
            </button>
          </CopyToClipboard>

          <div css={actionContainerStyles}>
            <div css={insightContainerStyles}>
              <div
                css={insightStyles}
                onClick={() =>
                  sidebarData.toggleSidebar({ type: 'annotations' })
                }
              >
                <span css={insightIconStyles}>
                  <Chat />
                </span>
                <span>{annotations?.length || 0}</span>
              </div>

              <Popover.Root>
                <Popover.Trigger>
                  <div css={insightStyles}>
                    <span css={insightIconStyles}>
                      <LineChart />
                    </span>
                    <span>{events?.length || 0}</span>
                  </div>
                </Popover.Trigger>

                <Popover.Content
                  avoidCollisions={true}
                  css={dataPopoverStyles}
                  sideOffset={4}
                  hideWhenDetached={true}
                  sticky="always"
                >
                  {events &&
                    events.map(
                      ({ name, created_at: createdAt, meta, id: eventId }) => (
                        <div css={eventDataItemStyles} key={eventId}>
                          <p css={eventDataItemTitleStyles}>
                            <span>{name}</span>
                            <span css={eventDataItemDateStyles}>
                              {format(fromUnixTime(createdAt / 1000), `MMM do`)}
                            </span>
                          </p>
                          <p css={eventDataItemMetaStyles}>{meta}</p>
                        </div>
                      )
                    )}
                </Popover.Content>
              </Popover.Root>
            </div>
            <button css={deleteButtonStyles} onClick={() => onRemoveAlias(id)}>
              <Trash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
