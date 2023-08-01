/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useParams } from 'react-router-dom';
import { Button } from '../../atoms';
import { Plus } from '../../icons';
import { SearchBar } from '../../molecules';
import { cssVar, smallScreenQuery } from '../../primitives';
import { dashboard, notebookList } from '../../styles';

const ROUTES_WHITELIST = ['', 'edit', 'members', 'connections'];

type DashboardTopbarProps = {
  readonly onCreateNotebook?: () => void;

  readonly onPointerEnter?: () => void;
};

export const DashboardTopbar = ({
  onCreateNotebook = noop,

  onPointerEnter,
}: DashboardTopbarProps): ReturnType<React.FC> => {
  const { '*': maybeWorkspaceFolder } = useParams();
  const isRouteAllowed =
    maybeWorkspaceFolder != null &&
    ROUTES_WHITELIST.includes(maybeWorkspaceFolder);
  const displaySearchBoxBorder = isRouteAllowed;

  return (
    <div
      css={css({
        [smallScreenQuery]: {
          backgroundColor: cssVar('backgroundDefault'),
          display: 'none',
        },
      })}
    >
      <div
        css={[
          dashboardTopbarWrapperStyles,
          displaySearchBoxBorder && {
            borderBottom: `1px solid ${cssVar('borderSubdued')}`,
            [smallScreenQuery]: {
              borderBottom: 0,
            },
          },
        ]}
        onPointerEnter={onPointerEnter}
      >
        <div css={leftStyles}>
          <SearchBar />
        </div>
        <div css={rightStyles}>
          <Button
            type="primaryBrand"
            size="extraSlim"
            onClick={onCreateNotebook}
          >
            <div
              css={{
                display: 'inline-flex',
                gap: 8,
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }}
            >
              <span css={{ height: '18px', width: '18px' }}>
                <Plus />
              </span>
              <span>New Notebook</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

const dashboardTopbarWrapperStyles = css({
  padding: `
    ${dashboard.topPadding}
    ${notebookList.horizontalPadding}
  `,

  display: 'flex',
  justifyContent: 'space-between',
  columnGap: '32px',

  flexWrap: 'wrap-reverse',
  rowGap: '32px',
  [smallScreenQuery]: {
    backgroundColor: cssVar('backgroundMain'),
  },
});
const leftStyles = css({
  display: 'grid',
  width: 'calc(100% - 180px)',
  alignItems: 'baseline',
  [smallScreenQuery]: {
    padding: '16px 16.5px',
    borderRadius: '6px',
  },
});
const rightStyles = css({
  display: 'grid',
  gridAutoFlow: 'column',
  alignItems: 'center',
  columnGap: '16px',
  [smallScreenQuery]: {
    display: 'none',
  },
});
