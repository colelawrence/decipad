import { isFlagEnabled } from '@decipad/feature-flags';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import format from 'date-fns/format';
import { ColorStatus, Divider } from '../../atoms';
import {
  Archive,
  Calendar,
  Copy,
  Download,
  FolderOpen,
  Trash,
} from '../../icons';
import { cssVar, p12Medium, p14Medium } from '../../primitives';
import { card } from '../../styles';
import { AvailableColorStatus, TColorStatus } from '../../utils';

const styles = css({
  ...card.styles,
  padding: '6px 6px',
  width: '170px',
  boxShadow:
    '0px 1px 2px rgb(119 126 137 / 2%), 0px 2px 12px rgb(119 126 137 / 8%)',
});
const actionStyles = css(p14Medium, {
  display: 'grid',
  borderRadius: '8px',
  rowGap: '10px',
  '&:hover': {
    backgroundColor: cssVar('highlightColor'),
  },
  '& button, & a button': {
    ...p14Medium,
    padding: '6px',
    lineHeight: '20px',
  },
  marginBottom: '4px',
});

const calendarIconStyles = css({
  display: 'inline-block',
  width: '16px',
  height: '13px',
  opacity: 0.5,
});

const creationDateStyles = css(p12Medium, {
  paddingTop: '8px',
  lineHeight: '20px',
  backgroundColor: cssVar('highlightColor'),
  border: `1px solid ${cssVar('borderColor')}`,
  color: cssVar('weakTextColor'),
  margin: '-7px',
  marginTop: 0,
  borderRadius: '0 0 8px 8px',
  padding: 4,
  paddingLeft: 8,
});

interface NotebookListItemActionsProps {
  readonly href: string;
  readonly status?: TColorStatus;
  readonly archivePage?: boolean;

  readonly onDuplicate?: () => void;
  readonly onDelete?: () => void;
  readonly onUnarchive?: () => void;
  readonly onExport?: () => void;
  readonly onChangeStatus?: (status: TColorStatus) => void;
  readonly toggleActionsOpen?: () => void;

  readonly creationDate?: Date;
}
export const NotebookListItemActions = ({
  href,
  status = 'draft',
  onDuplicate = noop,
  onDelete = noop,
  onExport = noop,
  onUnarchive = noop,
  onChangeStatus = noop,
  toggleActionsOpen = noop,
  creationDate,
  archivePage,
}: NotebookListItemActionsProps): ReturnType<React.FC> => {
  const currentStatus = status;

  return (
    <nav css={styles}>
      <ul>
        <li css={actionStyles}>
          <button
            css={css({ display: 'inline-flex', gap: '5px' })}
            onClick={() => {
              onDuplicate();
              toggleActionsOpen();
            }}
          >
            <span css={css({ height: '20px', width: '20px' })}>
              <Copy />
            </span>
            Duplicate
          </button>
        </li>
        <li css={actionStyles}>
          <a
            href={href}
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              onExport();
              toggleActionsOpen();
            }}
          >
            <button css={css({ display: 'inline-flex', gap: '5px' })}>
              <span css={css({ height: '20px', width: '20px' })}>
                <Download />
              </span>
              Download
            </button>
          </a>
        </li>
        {archivePage ? (
          <li css={actionStyles}>
            <a
              href={href}
              onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                onUnarchive();
                toggleActionsOpen();
              }}
            >
              <button css={css({ display: 'inline-flex', gap: '5px' })}>
                <span css={css({ height: '20px', width: '20px' })}>
                  <FolderOpen />
                </span>
                Put back
              </button>
            </a>
          </li>
        ) : null}
        <li css={actionStyles}>
          <button
            onClick={() => {
              onDelete();
              toggleActionsOpen();
            }}
            css={css({ display: 'inline-flex', gap: '5px' })}
          >
            <span css={css({ height: '20px', width: '20px' })}>
              {archivePage ? <Trash /> : <Archive />}
            </span>
            {archivePage ? 'Delete' : 'Archive'}
          </button>
        </li>
        {isFlagEnabled('DASHBOARD_STATUS')
          ? [
              <li css={actionStyles}>
                <Divider />
              </li>,
              AvailableColorStatus.map((label) => (
                <li css={actionStyles}>
                  <ColorStatus
                    toggleActionsOpen={toggleActionsOpen}
                    onChangeStatus={onChangeStatus}
                    name={label}
                    selected={currentStatus === label}
                  />
                </li>
              )),
            ]
          : null}
        {creationDate && (
          <li css={creationDateStyles}>
            <span css={calendarIconStyles}>
              <Calendar />
            </span>{' '}
            <span>Created: {format(creationDate, 'd MMM Y')}</span>
          </li>
        )}
      </ul>
    </nav>
  );
};
