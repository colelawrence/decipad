import { useClientEvents } from '@decipad/client-events';
import { useConnectionStore } from '@decipad/react-contexts';
import { useEffect } from 'react';

export function useAnalytics() {
  const [stage, connectionType, createIntegration] = useConnectionStore((s) => [
    s.stage,
    s.connectionType,
    s.createIntegration,
  ]);

  const track = useClientEvents();

  useEffect(() => {
    if (
      connectionType !== 'notion' &&
      connectionType !== 'codeconnection' &&
      connectionType !== 'mysql' &&
      connectionType !== 'gsheets'
    ) {
      return;
    }

    if (stage === 'connect') {
      track({
        segmentEvent: {
          type: 'action',
          action: 'Integration: Notebook viewed',
          props: { type: connectionType },
        },
      });
    }

    if (createIntegration) {
      track({
        segmentEvent: {
          type: 'action',
          action: 'Integration: Notebook Integration added',
          props: { type: connectionType },
        },
      });
    }
  }, [connectionType, stage, track, createIntegration]);
}
