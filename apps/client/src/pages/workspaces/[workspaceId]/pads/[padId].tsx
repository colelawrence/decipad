import { useQueryProperties } from '../../../../hooks/useQueryProperties';
import Pad from '../../../../components/Pad/Pad';

const PadPage = () => {
  const props = useQueryProperties(['workspaceId', 'padId']);

  if (props != null) {
    return <Pad {...props} />;
  } else {
    // TODO 404 here
    return null;
  }
};

export default PadPage;
