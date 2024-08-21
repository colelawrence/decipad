/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint decipad/css-prop-named-variable: 0 */
import { SearchFieldWithDropdown } from 'libs/ui/src/shared/molecules';
import { Children, FC, useState } from 'react';
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
import { EditorSidebarProps, SelectedTab } from './types';
import { css } from '@emotion/react';
import { deciOverflowYStyles } from 'libs/ui/src/styles/scrollbars';

const AVAILABLE_TABS: SelectedTab[] = ['block', 'variable'];

const getTriggerMetaForTab = (tab: SelectedTab) => {
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
    default:
      return {
        tooltip: tab,
        label: tab,
        children: <SidebarIcon description={tab} icon={<Formula />} />,
      };
  }
};

export const EditorSidebar: FC<EditorSidebarProps> = ({
  children,
  search,
  setSearch,
}) => {
  const [variable, block] = Children.toArray(children);
  const [activeTab, setActiveTab] = useState<SelectedTab>('block');

  return (
    <div css={sidebarColumnStyles} data-testid="editor-sidebar">
      <TabsRoot
        styles={sidebarWrapperStyles}
        defaultValue={activeTab}
        onValueChange={(newValue: string) => {
          if (AVAILABLE_TABS.includes(newValue as SelectedTab)) {
            setActiveTab(newValue as SelectedTab);
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

          <SearchFieldWithDropdown
            searchTerm={search}
            onSearchChange={(newValue) => {
              setSearch(newValue.toLocaleLowerCase());
            }}
            placeholder={
              activeTab === 'variable'
                ? 'Search for variables...'
                : 'Search for blocks...'
            }
            icon={<MagnifyingGlass />}
          />

          <div css={tabWrapperStyles}>
            <TabsContent name="variable">{variable}</TabsContent>
            <TabsContent name="block">{block}</TabsContent>
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
