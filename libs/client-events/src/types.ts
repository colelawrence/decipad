import type { ActionEvent } from './action';
import { IncidentEvent } from './incidents';
import type { PageEvent } from './page';

export type ClientEvent = PageEvent | ActionEvent | IncidentEvent;

export type AnalyticsProviderApi = {
  identify: (userId: string, traits: Record<string, unknown>) => void;
  track: (event: ClientEvent) => void;
  page: (page: string) => void;
};
