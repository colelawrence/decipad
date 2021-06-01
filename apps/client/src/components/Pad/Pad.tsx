import { DeciEditor } from '@decipad/editor';
import { Frame } from '../Frame/Frame';

interface PadProps {
  workspaceId: string;
  padId: string;
}

const Pad = ({ workspaceId, padId }: PadProps) => {
  return (
    <Frame>
      <DeciEditor workspaceId={workspaceId} padId={padId} />
    </Frame>
  );
};

export default Pad;
