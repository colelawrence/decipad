import { notebooks, workspaces } from '@decipad/routing';
import { FC } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';

export const NotebookRedirect: FC = () => {
  const { '*': subpath } = useParams();
  const [searchParams] = useSearchParams();
  if (!subpath) {
    throw new Error('Missing subpath for redirect');
  }
  return (
    <Navigate
      replace
      to={`${notebooks({}).$}/${subpath}?${searchParams.toString()}`}
    />
  );
};

export const WorkspaceRedirect: FC = () => {
  const { '*': subpath } = useParams();
  const [searchParams] = useSearchParams();
  if (!subpath) {
    throw new Error('Missing subpath for redirect');
  }
  return (
    <Navigate
      replace
      to={`${workspaces({}).$}/${subpath}?${searchParams.toString()}`}
    />
  );
};
