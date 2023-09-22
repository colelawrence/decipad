/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint decipad/css-prop-named-variable: 0 */
import { Children, FC } from 'react';
import { InputField, SidebarIcon } from '../../atoms';
import { FileText, Formula, Plus, Search } from '../../icons';
import {
  sidebarColumnStyles,
  sidebarContentStyles,
  sidebarSearchBoxStyles,
  sidebarSearchIconStyles,
  sidebarWrapperStyles,
} from './styles';
import { EditorSidebarProps, SelectedTab } from './types';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@decipad/ui';

const AVAILABLE_TABS: SelectedTab[] = ['block', 'variable'];

const getTriggerMetaForTab = (tab: SelectedTab) => {
  switch (tab) {
    case 'variable':
      return {
        tooltip: 'Re-use data and variables',
        label: 'Data',
        children: <SidebarIcon description={'Data'} icon={<FileText />} />,
      };
    case 'block':
      return {
        tooltip: 'Insert new blocks',
        label: 'Insert',
        children: <SidebarIcon description={'Insert'} icon={<Plus />} />,
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
  sidebarTab,
  setSidebarTab,
}) => {
  const [variable, block] = Children.toArray(children);

  return (
    <div css={sidebarColumnStyles} data-testid="editor-sidebar">
      <TabsRoot css={[sidebarWrapperStyles]} defaultValue={sidebarTab}>
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
                  testId={`sidebar-${label}`}
                  trigger={{
                    label,
                    children: tabChildren,
                    tooltip,
                    onClick: () => setSidebarTab(tab),
                    disabled: false,
                    selected: sidebarTab === tab,
                  }}
                />
              );
            })}
          </TabsList>

          <div css={sidebarSearchBoxStyles}>
            <div css={sidebarSearchIconStyles}>
              <Search />
            </div>
            <InputField
              value={search}
              onChange={(newValue) => {
                setSearch(newValue.toLocaleLowerCase());
              }}
              size="small"
              placeholder={
                sidebarTab === 'variable'
                  ? 'Search for variables...'
                  : 'Search for blocks...'
              }
            ></InputField>
          </div>

          <div
            css={[
              {
                paddingBottom: 120,
                width: '100%',
              },
              {
                '& > div > div[role="menu"]': {
                  margin: '-16px -8px',
                  gridTemplateColumns: '1fr',
                },
              },
            ]}
          >
            <TabsContent name="variable">{variable}</TabsContent>
            <TabsContent name="block">{block}</TabsContent>
          </div>
        </div>
      </TabsRoot>
    </div>
  );
};
