import { Avatar } from 'libs/ui/src/shared';
import { GetNotebookAnnotationsQuery } from '@decipad/graphql-client';

import { CaretDown } from 'libs/ui/src/icons';

import { useMemo } from 'react';

import * as Styled from './styles';
import { pluralize } from '@decipad/language-utils';

export type AnnotationArray = NonNullable<
  GetNotebookAnnotationsQuery['getAnnotationsByPadId']
>;

export type Annotation = NonNullable<AnnotationArray[number]>;
type User = Annotation['user'];

export const CollapsedAnnotation = ({
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
    <Styled.Wrapper
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
          <Styled.AvatarStack>
            {users
              .map((user) => (
                <Styled.Avatar>
                  <Avatar
                    size={20}
                    name={user?.username || ''}
                    useSecondLetter={false}
                    imageHash={user?.avatar}
                  />
                </Styled.Avatar>
              ))
              .slice(0, 5)}
          </Styled.AvatarStack>
          <Styled.CommentCount>
            {annotations.length} {pluralize('comment', annotations.length)}
          </Styled.CommentCount>
        </>
      )}
      <Styled.Caret>
        <CaretDown />
      </Styled.Caret>
    </Styled.Wrapper>
  );
};
