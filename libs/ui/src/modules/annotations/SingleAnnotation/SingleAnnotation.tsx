/* eslint decipad/css-prop-named-variable: 0 */
import { GetNotebookAnnotationsQuery } from '@decipad/graphql-client';

import { format, fromUnixTime } from 'date-fns';
import { Avatar, MenuItem, MenuList, Tooltip } from 'libs/ui/src/shared';
import { useCallback } from 'react';

import * as Styled from './styles';
import { Ellipsis } from 'libs/ui/src/icons';
import { useAnnotations } from '@decipad/react-contexts';
import { useSession } from 'next-auth/react';
import { User } from 'next-auth';

type AnnotationArray = NonNullable<
  GetNotebookAnnotationsQuery['getAnnotationsByPadId']
>;

type Annotation = NonNullable<AnnotationArray[number]>;

const renderAnnotationString = (annotationString: string) => {
  return annotationString.split('\n').map((str, index) => {
    return (
      <span key={index}>
        {str}
        <br />
      </span>
    );
  });
};

export const SingleAnnotation = ({
  id,
  user,
  content,
  dateCreated,
  deleteAnnotation,
}: Annotation & {
  deleteAnnotation: (annotationId: string) => void;
}) => {
  const { permission } = useAnnotations();
  const { data: session } = useSession();
  const currentUser = session?.user as User;
  const currentUserId = currentUser?.id;

  const isOwner = user?.id === currentUserId;

  const canDelete = isOwner || permission === 'ADMIN';

  const handleDelete = useCallback(
    (annotationId: string) => {
      deleteAnnotation(annotationId);
    },
    [deleteAnnotation]
  );

  return (
    <Styled.Wrapper>
      <Styled.Avatar>
        <Avatar
          name={user?.username || ''}
          useSecondLetter={false}
          imageHash={user?.avatar}
          size={20}
        />
      </Styled.Avatar>
      <Styled.Header>
        <Styled.Meta>
          <Styled.Username>{user?.username}</Styled.Username>
          <Tooltip
            trigger={
              <Styled.Date>
                {format(fromUnixTime(dateCreated / 1000), `MMM do`)}
              </Styled.Date>
            }
          >
            <p>
              {format(fromUnixTime(dateCreated / 1000), `HH:mm, MMM do, yyyy`)}
            </p>
          </Tooltip>
        </Styled.Meta>
        {canDelete && (
          <MenuList
            root
            dropdown
            align="end"
            sideOffset={4}
            portal={false}
            trigger={
              <Styled.MenuButton>
                <Ellipsis />
              </Styled.MenuButton>
            }
          >
            <MenuItem onSelect={() => handleDelete(id)}>
              <p css={{ minWidth: '132px' }}>Delete</p>
            </MenuItem>
          </MenuList>
        )}
      </Styled.Header>
      <Styled.Content>{renderAnnotationString(content)}</Styled.Content>
    </Styled.Wrapper>
  );
};
