/* eslint-disable decipad/css-prop-named-variable */
import { FC } from 'react';
import { MagnifyingGlass } from '../../icons';
import { cssVar } from '../../primitives';
import { SearchFieldWithDropdown } from '../../shared';
import * as Styled from './styles';
import type { NavigationSidebarProps } from './types';
import styled from '@emotion/styled';
import {
  PanelGroup,
  PanelResizeHandle,
  PanelGroupProps,
} from 'react-resizable-panels';
import { NumberCatalogPane } from './NumberCatalogPane';
import { NotebookNavigationPane } from './NotebookNavigationPane';

export const minWidthForItemStyles = { minWidth: '132px' };

const StyledSplitPane = styled(PanelGroup)<PanelGroupProps>({
  // Panel component sets a height: 100% internally...
  height: 'calc(100% - 80px) !important',
});

const ResizableDivider = styled(PanelResizeHandle)({
  backgroundColor: cssVar('backgroundHeavy'),
  height: '1px',
  margin: '8px 0 8px 12px',
  ':hover': {
    height: '3px',
    margin: '7px 0 7px 12px',
  },
});

export const NavigationSidebar: FC<NavigationSidebarProps> = ({
  sections,
  numberCatalog,
  notebooks,
  workspaceId,
  notebookId,
  workspaces,
  actions,
  toggleAddNewVariable,
  search,
  setSearch,
}) => {
  return (
    <Styled.NavigationSidebarWrapperStyles>
      <div css={{ marginBottom: '8px' }}>
        <SearchFieldWithDropdown
          searchTerm={search}
          onSearchChange={(newValue) => {
            setSearch(newValue.toLocaleLowerCase());
          }}
          placeholder="Search"
          icon={<MagnifyingGlass />}
          hasGreyBackGround={true}
        />
      </div>
      <StyledSplitPane direction="vertical" autoSaveId="leftSideBar">
        <NotebookNavigationPane
          sections={sections}
          workspaceId={workspaceId}
          notebooks={notebooks}
          notebookId={notebookId}
          workspaces={workspaces}
          actions={actions}
        />
        <ResizableDivider />
        <NumberCatalogPane
          numberCatalog={numberCatalog}
          toggleAddNewVariable={toggleAddNewVariable}
        />
      </StyledSplitPane>
    </Styled.NavigationSidebarWrapperStyles>
  );
};
