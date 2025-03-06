type IntegrationRemovedIncident = {
  type: 'incident';
  events: Array<object>;
};

export type IncidentEvent = IntegrationRemovedIncident;
