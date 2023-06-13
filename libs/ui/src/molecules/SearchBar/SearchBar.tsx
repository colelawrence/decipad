/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import capitalize from 'lodash.capitalize';
import { create } from 'zustand';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as icons from '../../icons';
import { smallestDesktop } from '../../primitives';
import { FilterBubbles } from '../FilterBubbles/FilterBubbles';
import { MenuList } from '../MenuList/MenuList';
import { AvailableColorStatus, ColorStatusNames } from '../../utils';
import { ColorStatusCircle, InputField, MenuItem } from '../../atoms';

type SearchBarProps = {
  compact?: boolean;
};

const ROUTES_WHITELIST = ['', 'edit', 'members', 'connections'];

export const useSearchBarStore = create<{
  search: string;
  status: string[];
  visibility: string;
  setSearch: (search: string) => void;
  setStatus: (status: string[]) => void;
  setVisibility: (visibility: string) => void;
}>((set) => ({
  search: '',
  status: [],
  visibility: '',
  setSearch: (search: string) => set({ search }),
  setStatus: (status: string[]) => set({ status }),
  setVisibility: (visibility: string) => set({ visibility }),
}));

export const SearchBar: React.FC<SearchBarProps> = ({ compact }) => {
  const { search, setSearch, status, setStatus, visibility, setVisibility } =
    useSearchBarStore();
  const [statusOpen, setStatusOpen] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);

  const { '*': maybeWorkspaceFolder } = useParams();
  const isRouteAllowed =
    maybeWorkspaceFolder != null &&
    ROUTES_WHITELIST.includes(maybeWorkspaceFolder);
  const displaySearchBox = isRouteAllowed;
  const noNulls = useMemo(
    () => status.filter((x) => x !== null) as string[],
    [status]
  );

  if (!displaySearchBox) {
    return <div />;
  }

  const wrapperStyles = compact ? compactSearchBarStyles : searchBarStyles;

  return (
    <div css={wrapperStyles}>
      <div css={inputStyles}>
        <span css={{ height: '18px', width: '18px' }}>
          <icons.Search />
        </span>
        <span css={css({ width: '100%' })} data-testid="search-bar">
          <InputField
            type="search"
            placeholder="Search notebook"
            value={search}
            onChange={setSearch}
          />
        </span>
      </div>
      <div css={filtersStyles}>
        <MenuList
          root
          dropdown
          align="start"
          side="bottom"
          sideOffset={10}
          open={visibilityOpen}
          onChangeOpen={setVisibilityOpen}
          trigger={
            <div>
              <FilterBubbles
                description={
                  visibility === ''
                    ? 'Filter by visibility'
                    : capitalize(visibility)
                }
                icon={<icons.Caret variant="down" />}
              />
            </div>
          }
        >
          {visibility === '' ? null : (
            <MenuItem
              key={'clear-status'}
              icon={<icons.Close />}
              onSelect={() => {
                setVisibility('');
                setVisibilityOpen(!visibilityOpen);
              }}
            >
              <span>Clear</span>
            </MenuItem>
          )}

          <MenuItem
            icon={<icons.Globe />}
            onSelect={() => {
              setVisibility('public');
              setVisibilityOpen(!visibilityOpen);
            }}
            selected={visibility === 'public'}
          >
            <span>Public</span>
          </MenuItem>
          <MenuItem
            icon={<icons.Hide />}
            onSelect={() => {
              setVisibility('private');
              setVisibilityOpen(!visibilityOpen);
            }}
            selected={visibility === 'private'}
          >
            <span>Private</span>
          </MenuItem>
        </MenuList>
        <MenuList
          root
          dropdown
          align="start"
          side="bottom"
          sideOffset={10}
          open={statusOpen}
          onChangeOpen={setStatusOpen}
          trigger={
            <div>
              <FilterBubbles
                description={
                  noNulls.length > 0
                    ? noNulls.map((s) => capitalize(s)).join(', ')
                    : 'Filter by status'
                }
                icon={<icons.Caret variant="down" />}
              />
            </div>
          }
        >
          {noNulls.length > 0 ? (
            <MenuItem
              key={'clear-status'}
              icon={<icons.Close />}
              onSelect={() => {
                setStatus([]);
                setStatusOpen(!statusOpen);
              }}
            >
              <span>Clear</span>
            </MenuItem>
          ) : null}
          {AvailableColorStatus.map((label) => (
            <MenuItem
              key={label}
              icon={<ColorStatusCircle name={label} />}
              onSelect={() => {
                const statusCopy = status.slice();
                const i = statusCopy.indexOf(label);
                if (i > -1) {
                  statusCopy.splice(i, 1);
                } else {
                  statusCopy.push(label);
                }

                setStatus(statusCopy);
                setStatusOpen(!statusOpen);
              }}
              selected={noNulls.includes(label)}
            >
              <span>{ColorStatusNames[label]}</span>
            </MenuItem>
          ))}
        </MenuList>
      </div>
    </div>
  );
};

const searchBarStyles = css({
  display: 'inline-flex',
  gap: 8,
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'center',
  alignContent: 'center',
  justifyContent: 'space-between',
  height: '100%',
  [`@media (max-width: ${smallestDesktop.landscape.width}px)`]: {
    display: 'none',
  },
});

const compactSearchBarStyles = css({
  display: 'inline-flex',
  gap: 8,
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  alignContent: 'flex-start',
  justifyContent: 'space-between',
  height: '24px',
});

const filtersStyles = css({
  display: 'inline-flex',
  gap: 8,
});

const inputStyles = css({
  display: 'flex',
  gap: 12,
  flex: 1,
  minWidth: '24ch',
});
