import {
  Annotations as UIAnnotations,
  IN_EDITOR_SIDEBAR_ID,
} from '@decipad/ui';
import { createPortal } from 'react-dom';

type AnnotationsProps = {
  notebookId: string;
};

const Annotations: React.FC<AnnotationsProps> = ({ notebookId }) => {
  return createPortal(
    <UIAnnotations notebookId={notebookId} />,
    document.getElementById(IN_EDITOR_SIDEBAR_ID)!
  );
};

export default Annotations;
