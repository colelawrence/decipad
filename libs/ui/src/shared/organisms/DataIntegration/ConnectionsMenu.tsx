import { useWorkspaceExternalData } from '@decipad/graphql-client';
import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDiagonalTopRight, CaretDown } from '../../../icons';
import { cssVar, p13Medium } from '../../../primitives';
import { editorLayout } from '../../../styles';
import { Divider, MenuItem } from '../../atoms';
import { MenuList } from '../../molecules';

interface ConnectionMenuProps {
  workspaceId: string;
  selectedDataSource: string | undefined;
  onSelectConnection: (connectionId: string, connectionName: string) => void;
}

export const ConnectionsMenu: FC<ConnectionMenuProps> = ({
  workspaceId,
  selectedDataSource,
  onSelectConnection,
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { workspaceExternalData } = useWorkspaceExternalData(workspaceId);

  const onNavigateToConnections = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      navigate(
        workspaces({})
          .workspace({
            workspaceId,
          })
          .connections({})
          .sqlConnections({}).$
      );
    }, 0);
  }, [navigate, workspaceId]);

  return (
    <div css={wrapperStyles}>
      <MenuList
        root
        dropdown
        open={open}
        sideOffset={12}
        onChangeOpen={setOpen}
        trigger={
          <span css={categoryAndCaretStyles}>
            <span css={titleStyles}>
              {/* Without text the icon has no line height, and so floats
                            upwards, hence the non-breaking space */}
              {'\uFEFF'}
              {selectedDataSource ?? 'Add SQL Connection'}
            </span>
            <span css={iconStyles} data-testid="insert-data-connections-button">
              <CaretDown />
            </span>
          </span>
        }
      >
        {workspaceExternalData &&
          workspaceExternalData.map((source) => (
            <MenuItem
              key={source.id}
              onSelect={() => {
                if (source.dataUrl && source.dataSourceName) {
                  onSelectConnection(source.dataUrl, source.dataSourceName);
                } else {
                  throw new Error('DATA URL NOT FOUND OR NO NAME');
                }
              }}
            >
              <span>{source.dataSourceName}</span>
            </MenuItem>
          ))}

        {workspaceExternalData && workspaceExternalData.length > 0 && (
          <div role="presentation" css={hrStyles}>
            <Divider />
          </div>
        )}

        <MenuItem
          icon={<ArrowDiagonalTopRight />}
          onSelect={onNavigateToConnections}
        >
          <span>SQL</span>
        </MenuItem>
      </MenuList>
    </div>
  );
};

const wrapperStyles = css({
  display: 'inline-block',
  cursor: 'pointer',
});

const categoryAndCaretStyles = css([
  editorLayout.hideOnPrint,
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
    boxShadow: `0 0 0 0.5px ${cssVar('borderSubdued')}`,
  },
});

const iconStyles = css({
  width: 18,
  display: 'grid',
});

const titleStyles = css(p13Medium, { color: cssVar('textTitle') });
