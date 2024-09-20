import { PlateComponent } from '@decipad/editor-types';
import { ErrorBlock } from '@decipad/ui';

/**
 * Block to replace live connections so users have a chance
 * to migrate their notebooks.
 */
export const CrashingLiveConnection: PlateComponent = () => {
  return (
    <div css={{ paddingTop: '8px', paddingBottom: '8px' }}>
      <ErrorBlock
        type="info"
        message="Live Connections are now deprecated. Please contact support we'll help
      you, otherwise check out our integration docs:
      https://app.decipad.com/docs/integrations/SQL"
      />
    </div>
  );
};
