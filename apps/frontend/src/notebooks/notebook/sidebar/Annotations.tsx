import { Annotations as UIAnnotations } from '@decipad/ui';

type AnnotationsProps = {
  notebookId: string;
};

const Annotations: React.FC<AnnotationsProps> = ({ notebookId }) => {
  return <UIAnnotations notebookId={notebookId} />;
};

export default Annotations;
