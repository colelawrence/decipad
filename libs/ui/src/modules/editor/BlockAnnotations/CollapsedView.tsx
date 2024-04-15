import { Avatar } from 'libs/ui/src/shared';
import { GetNotebookAnnotationsQuery } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { CaretDown, CaretUp } from 'libs/ui/src/icons';
import { tabletScreenQuery } from 'libs/ui/src/primitives';
import { SIDEBAR_WIDTH } from 'libs/ui/src/pages/NotebookPage/styles';
import { useMemo } from 'react';

export type AnnotationArray = NonNullable<
  GetNotebookAnnotationsQuery['getAnnotationsByPadId']
>;

export type Annotation = NonNullable<AnnotationArray[number]>;
type User = Annotation['user'];

const avatarStackStyles = css(`
  display: flex;
`);

const avatarContainerStyles = css({
  width: '28px',
  height: '28px',
  marginRight: '-8px',
  [tabletScreenQuery]: {
    marginRight: 0,
  },
});

const Header = styled.header({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  padding: '8px 16px',
  cursor: 'pointer',
  width: SIDEBAR_WIDTH,
  [tabletScreenQuery]: {
    display: 'none',
  },
});

const TabletHeader = styled.header<{ collapsed: boolean }>(({ collapsed }) => ({
  display: 'none',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  padding: collapsed ? '6px' : '8px 16px',
  cursor: 'pointer',
  width: collapsed ? 'auto' : SIDEBAR_WIDTH,
  [tabletScreenQuery]: {
    display: 'grid',
  },
}));

const commentCountStyles = css({
  marginLeft: '16px',
});

const chevronContainerStyles = css({
  gridColumn: '3',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  '& > svg': {
    width: '12px',
    height: '12px',
  },
});

export const CollapsedView = ({
  collapsed,
  setCollapsed,
  annotations,
}: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  annotations: AnnotationArray;
}) => {
  const users = useMemo(() => {
    return annotations
      .map((annotation) => annotation?.user)
      .filter<NonNullable<User>>(
        (user): user is NonNullable<User> => user !== null
      )
      .reduce((acc, user) => {
        if (!acc.some((u) => u.id === user.id)) {
          return [user, ...acc];
        }
        return acc;
      }, [] as NonNullable<User>[]);
  }, [annotations]);

  return (
    // Using header as a hack to allow first-of-type selector on annotations
    <>
      <Header
        style={collapsed ? {} : { paddingBottom: '0' }}
        onClick={() => {
          if (collapsed) {
            setCollapsed(false);
          } else {
            setCollapsed(true);
          }
        }}
      >
        {collapsed && (
          <>
            <div css={avatarStackStyles}>
              {users
                .map((user) => (
                  <div css={avatarContainerStyles}>
                    <Avatar
                      name={user?.username || ''}
                      useSecondLetter={false}
                      imageHash={user?.avatar}
                    />
                  </div>
                ))
                .slice(0, 5)}
            </div>
            <div css={commentCountStyles}>
              {annotations.length} comment{annotations.length > 1 ? 's' : ''}
            </div>
          </>
        )}
        <div css={chevronContainerStyles}>
          {collapsed ? <CaretUp /> : <CaretDown />}
        </div>
      </Header>
      <TabletHeader
        style={collapsed ? {} : { paddingBottom: '0' }}
        collapsed={collapsed}
        onClick={() => {
          if (collapsed) {
            setCollapsed(false);
          } else {
            setCollapsed(true);
          }
        }}
      >
        {collapsed && (
          <>
            <div css={avatarStackStyles}>
              {users
                .map((user) => (
                  <div css={avatarContainerStyles}>
                    <Avatar
                      name={user?.username || ''}
                      useSecondLetter={false}
                      imageHash={user?.avatar}
                    />
                  </div>
                ))
                .slice(0, 5)}
            </div>
          </>
        )}
        {!collapsed && (
          <div css={chevronContainerStyles}>
            {collapsed ? <CaretUp /> : <CaretDown />}
          </div>
        )}
      </TabletHeader>
    </>
  );
};
