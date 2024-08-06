import { useGetNotebookAnnotationsQuery } from '@decipad/graphql-client';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import {
  Annotations as UIAnnotations,
  IN_EDITOR_SIDEBAR_ID,
} from '@decipad/ui';
import { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';

type AnnotationsProps = {
  notebookId: string;
};

const Annotations: FC<AnnotationsProps> = ({ notebookId }) => {
  const [annotations, setAnnotations] = useNotebookWithIdState(
    (s) => [s.annotations, s.setAnnotations] as const
  );

  const [{ data }] = useGetNotebookAnnotationsQuery({
    variables: { notebookId },
  });

  useEffect(() => {
    const graphqlAnnotations = data?.getAnnotationsByPadId;

    if (graphqlAnnotations != null && annotations !== graphqlAnnotations) {
      setAnnotations(graphqlAnnotations);
    }
  }, [annotations, data?.getAnnotationsByPadId, setAnnotations]);

  return createPortal(
    <UIAnnotations />,
    document.getElementById(IN_EDITOR_SIDEBAR_ID)!
  );
};

export default Annotations;
