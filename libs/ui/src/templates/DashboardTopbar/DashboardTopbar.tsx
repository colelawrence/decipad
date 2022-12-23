import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps } from 'react';
import { Button } from '../../atoms';
import { NotebookListHeader } from '../../molecules';
import { cssVar, smallScreenQuery } from '../../primitives';
import { dashboard, notebookList } from '../../styles';

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
    borderTop: `1px solid ${cssVar('borderColor')}`,
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    backgroundColor: cssVar('backgroundColor'),
  },
});
const leftStyles = css({
  display: 'grid',
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

type DashboardTopbarProps = Pick<
  ComponentProps<typeof NotebookListHeader>,
  'numberOfNotebooks'
> & {
  readonly onCreateNotebook?: () => void;

  readonly onPointerEnter?: () => void;
};

export const DashboardTopbar = ({
  numberOfNotebooks,

  onCreateNotebook = noop,

  onPointerEnter,
}: DashboardTopbarProps): ReturnType<React.FC> => {
  return (
    <div
      css={css({
        [smallScreenQuery]: {
          backgroundColor: cssVar('highlightColor'),
        },
      })}
    >
      <div css={dashboardTopbarWrapperStyles} onPointerEnter={onPointerEnter}>
        <div css={leftStyles}>
          <NotebookListHeader
            Heading="h1"
            numberOfNotebooks={numberOfNotebooks}
          />
        </div>
        <div css={rightStyles}>
          <Button
            type="primaryBrand"
            size="extraSlim"
            onClick={onCreateNotebook}
          >
            Create Notebook
          </Button>
        </div>
      </div>
    </div>
  );
};
