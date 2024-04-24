import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { Annotations as UIAnnotations } from '@decipad/ui';
import { useSession } from 'next-auth/react';

type AnnotationsProps = {
  notebookId: string;
};

const Annotations: React.FC<AnnotationsProps> = ({ notebookId }) => {
  // All of this code prevents the user from seeing the annotations sidebar if they are not a member of the notebook.
  // This fix is a little hacky, and is in place to get comments ready for release.
  // Linear ticker to remove this:
  // https://linear.app/decipad/issue/ENG-3203/refactor-logic-to-guard-comments-tab-from-from-opening-for-public
  const [notebook] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  const [setSidebar] = useNotebookMetaData((s) => [s.setSidebar]);
  const session = useSession();
  const id = session.data?.user?.id;
  if (!id) {
    setSidebar('closed');
    return null;
  }

  const currentUserPermission = notebook.data?.getPadById?.access.users.find(
    (user) => {
      return user.user?.id === id;
    }
  )?.permission;

  // another sort of hacky fix, will update all of this in next PR
  // we should probably add permissions to comment for readers too
  const hasWorkspaceAccess =
    notebook.data?.getPadById?.workspace?.myPermissionType != null;

  const isWriter =
    currentUserPermission === 'WRITE' ||
    currentUserPermission === 'ADMIN' ||
    hasWorkspaceAccess;

  if (!isWriter) {
    setSidebar('closed');
    return null;
  }

  return <UIAnnotations notebookId={notebookId} />;
};

export default Annotations;
