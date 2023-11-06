import { useEffect } from 'react';
import { useIntegrationContext } from '.';

interface IntegrationOptionActions {
  onRefresh: () => void;
  onShowSource: () => void;
  onDelete: () => void;
}

export function useIntegrationOptions({
  onRefresh,
  onShowSource,
  onDelete,
}: IntegrationOptionActions): void {
  const observable = useIntegrationContext();
  useEffect(() => {
    const sub = observable?.subscribe((action) => {
      switch (action) {
        case 'delete-block':
          onDelete();
          break;
        case 'refresh':
          onRefresh();
          break;
        case 'show-source': {
          onShowSource();
          break;
        }
      }
    });
    return () => {
      sub?.unsubscribe();
    };
  }, [observable, onDelete, onRefresh, onShowSource]);
}
