/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint decipad/css-prop-named-variable: 0 */
import { SearchFieldWithDropdown } from 'libs/ui/src/shared/molecules';
import { FC } from 'react';
import { Formula, MagnifyingGlass, Sheet, ShowMore } from '../../../icons';
import {
  SidebarIcon,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '../../../shared';
import {
  sidebarColumnStyles,
  sidebarContentStyles,
  sidebarWrapperStyles,
} from './styles';
import { EditorSidebarProps } from './types';
import { css } from '@emotion/react';
import { deciOverflowYStyles } from 'libs/ui/src/styles/scrollbars';
import { EditorSidebarTab } from '@decipad/editor-types';

const AVAILABLE_TABS: EditorSidebarTab[] = ['block', 'variable', 'format'];

const getTriggerMetaForTab = (tab: EditorSidebarTab) => {
  switch (tab) {
    case 'variable':
      return {
        tooltip: 'Re-use data and variables',
        label: 'Data',
        children: <SidebarIcon description={'Data'} icon={<Sheet />} />,
      };
    case 'block':
      return {
        tooltip: 'Insert new blocks',
        label: 'Insert',
        children: <SidebarIcon description={'Insert'} icon={<ShowMore />} />,
      };
    case 'format':
      return {
        tooltip: 'Format selected blocks',
        label: 'Format',
        children: <SidebarIcon description={'Format'} icon={<Sheet />} />,
      };
    default:
      return {
        tooltip: tab,
        label: tab,
        children: <SidebarIcon description={tab} icon={<Formula />} />,
      };
  }
};

export const EditorSidebar: FC<EditorSidebarProps> = ({
  selectedTab,
  onSelectTab,
  children,
  search,
  setSearch,
}) => {
  const [variable, block, format] = children;

  return (
    <div css={sidebarColumnStyles} data-testid="editor-sidebar">
      <TabsRoot
        styles={sidebarWrapperStyles}
        defaultValue={selectedTab}
        onValueChange={(newValue: string) => {
          if (AVAILABLE_TABS.includes(newValue as EditorSidebarTab)) {
            onSelectTab(newValue as EditorSidebarTab);
          } else {
            console.warn('Invalid tab value:', newValue);
          }
        }}
      >
        <div css={sidebarContentStyles}>
          <TabsList fullWidth>
            {AVAILABLE_TABS.map((tab) => {
              const {
                label,
                children: tabChildren,
                tooltip,
              } = getTriggerMetaForTab(tab);
              return (
                <TabsTrigger
                  name={tab}
                  key={label}
                  testId={`sidebar-${label}`}
                  trigger={{
                    label,
                    children: tabChildren,
                    tooltip,
                    disabled: false,
                  }}
                />
              );
            })}
          </TabsList>

          {selectedTab !== 'format' && (
            <SearchFieldWithDropdown
              searchTerm={search}
              onSearchChange={(newValue) => {
                setSearch(newValue.toLocaleLowerCase());
              }}
              placeholder={
                selectedTab === 'variable'
                  ? 'Search for variables...'
                  : 'Search for blocks...'
              }
              icon={<MagnifyingGlass />}
            />
          )}

          <div css={tabWrapperStyles}>
            <TabsContent name="variable">{variable}</TabsContent>
            <TabsContent name="block">{block}</TabsContent>
            <TabsContent name="format">{format}</TabsContent>
          </div>
        </div>
      </TabsRoot>
    </div>
  );
};

const tabWrapperStyles = css(deciOverflowYStyles, {
  width: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',

  '& > div > div[role="menu"]': {
    margin: '-16px -8px',
    gridTemplateColumns: '1fr',
  },
});
