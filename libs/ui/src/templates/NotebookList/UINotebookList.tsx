import { Children, ComponentProps, FC, ReactNode } from 'react';
import { DashboardDialogCTA, DragAndDropImportNotebook } from '../../organisms';
import { Generic, Info } from '../../icons';
import { dashboard, notebookList } from '../../styles';
import styled from '@emotion/styled';
import { cssVar, smallScreenQuery } from '../../primitives';

type UINotebookListProps = NonNullable<
  Pick<ComponentProps<typeof DragAndDropImportNotebook>, 'onImport'>
> & {
  // Did the search from searchbar return nothing?
  readonly isSearchEmpty: boolean;
  readonly children: ReactNode;
};

export const UINotebookList: FC<UINotebookListProps> = ({
  isSearchEmpty,
  onImport,
  children,
}) => (
  <NotebookWrapper>
    <DragAndDropImportNotebook onImport={onImport} enabled>
      <NotebookListWrapper>
        {Children.count(children) > 0 ? (
          <>
            {isSearchEmpty && (
              <NoSearchWarning>
                <div>
                  <Info />
                </div>
                <span data-testid="no-correct-search-result">
                  None of your notebooks matches your search, so we are showing
                  all notebooks that match your filters.
                </span>
              </NoSearchWarning>
            )}
            <ol className="notebookList">{children}</ol>
          </>
        ) : (
          <DashboardCTAWrapper>
            <DashboardDialogCTA
              icon={<Generic />}
              primaryText="No documents to list"
              secondaryText="When you create a document they will show up here"
            />
          </DashboardCTAWrapper>
        )}
      </NotebookListWrapper>
    </DragAndDropImportNotebook>
  </NotebookWrapper>
);

const NotebookWrapper = styled.div({
  padding: `2px ${notebookList.horizontalPadding}`,
  display: 'grid',
  [smallScreenQuery]: {
    paddingTop: '16px',
  },
});

const NotebookListWrapper = styled.div({
  alignSelf: 'start',
  paddingTop: '2px',
});

const NoSearchWarning = styled.div({
  padding: '16px',
  display: 'flex',
  whiteSpace: 'nowrap',
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: '8px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
});

const DashboardCTAWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  alignContent: 'space-around',
  justifyContent: 'space-around',
  alignItems: 'center',
  height: `calc(100%-${dashboard.CTAHeight})`,
});
