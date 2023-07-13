/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint decipad/css-prop-named-variable: 0 */
import { Children, FC } from 'react';
import { InputField, SegmentButtons, SidebarIcon } from '../../atoms';
import { AreaChart, Formula, Plus, Search } from '../../icons';
import { shortAnimationDuration } from '../../primitives';
import {
  sidebarColumnStyles,
  sidebarEllipsisStyles,
  sidebarPaddingStyles,
  sidebarSearchBoxStyles,
  sidebarSearchIconStyles,
  sidebarWrapperStyles,
} from './styles';
import { EditorSidebarProps, SelectedTab } from './types';

const availableTabs: SelectedTab[] = ['block', 'variable'];

const getMetaForTab = (tab: SelectedTab) => {
  switch (tab) {
    case 'variable':
      return {
        tooltip: 'Re-use data and variables',
        children: <SidebarIcon description={'Data'} icon={<AreaChart />} />,
      };
    case 'block':
      return {
        tooltip: 'Insert new blocks',
        children: <SidebarIcon description={'Insert'} icon={<Plus />} />,
      };
    default:
      return {
        tooltip: tab,
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
  sidebarOpen,
}) => {
  const [variable, block] = Children.toArray(children);

  return (
    <div css={sidebarColumnStyles}>
      <div
        css={[
          sidebarWrapperStyles,
          !sidebarOpen
            ? {
                width: 0,
                padding: 0,
              }
            : { transition: `width ${shortAnimationDuration} ease-in-out` },
        ]}
      >
        <div css={[sidebarPaddingStyles, { paddingTop: 0 }]}>
          <SegmentButtons
            buttons={availableTabs.map((tab) => {
              const { tooltip, children: buttonChildren } = getMetaForTab(tab);
              return {
                children: buttonChildren,
                onClick: () => setSidebarTab(tab),
                tooltip,
                testId: `sidebar-${tab}`,
                selected: sidebarTab === tab,
              };
            })}
            variant="editor-sidebar"
          />
        </div>
        <div css={sidebarPaddingStyles}>
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
          <div css={sidebarEllipsisStyles}></div>
        </div>
        <div
          css={[
            sidebarPaddingStyles,
            {
              'div[role="menu"]': {
                padding: 0,
              },
            },
            {
              paddingBottom: 100,
            },
          ]}
        >
          {sidebarTab === 'variable' ? (
            variable
          ) : sidebarTab === 'block' ? (
            block
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};
