import { GetNotebookAnnotationsQuery } from '@decipad/graphql-client';
import { createContext } from 'react';

export type AnnotationArray = NonNullable<
  GetNotebookAnnotationsQuery['getAnnotationsByPadId']
>;
type AnnotationsContextValue = {
  annotations: AnnotationArray | undefined;
  articleRef: React.RefObject<HTMLElement>;
  scenarioId: string | null;
  expandedBlockId: string | null;
  setExpandedBlockId: (id: string | null) => void;
};

export const AnnotationsContext = createContext<AnnotationsContextValue | null>(
  null
);
