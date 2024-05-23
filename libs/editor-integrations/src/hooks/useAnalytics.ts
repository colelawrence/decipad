import { useClientEvents } from '@decipad/client-events';
import { ImportElementSource } from '@decipad/editor-types';
import { useConnectionStore } from '@decipad/react-contexts';
import { useCallback, useEffect } from 'react';

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
          action: 'Notebook Integrations Modal Viewed',
          props: {
            integration_type: connectionType,
            analytics_source: 'backend',
          },
        },
      });
    }

    if (createIntegration) {
      track({
        segmentEvent: {
          type: 'action',
          action: 'Notebook Integration Created',
          props: {
            integration_type: connectionType,
            analytics_source: 'backend',
          },
        },
      });
    }
  }, [connectionType, stage, track, createIntegration]);
}

export function useTrackIntegrationRun(): (_: ImportElementSource) => void {
  const track = useClientEvents();

  const onRun = useCallback(
    (integrationType: ImportElementSource) => {
      if (
        integrationType !== 'codeconnection' &&
        integrationType !== 'gsheets' &&
        integrationType !== 'mysql' &&
        integrationType !== 'notion'
      ) {
        return;
      }

      track({
        segmentEvent: {
          type: 'action',
          action: 'Notebook Integration Query Submitted',
          props: {
            integration_type: integrationType,
            analytics_source: 'frontend',
          },
        },
      });
    },
    [track]
  );

  return onRun;
}
