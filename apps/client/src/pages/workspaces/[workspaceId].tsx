import { useQueryProperties } from '../../hooks/useQueryProperties';
import { Workspace } from '../../components/Workspace/Workspace';

const WorkspacePage = () => {
  const props = useQueryProperties(['workspaceId']);

  if (props != null) {
    return <Workspace {...props} />;
  } else {
    // TODO 404 here
    return null;
  }
};

export default WorkspacePage;
