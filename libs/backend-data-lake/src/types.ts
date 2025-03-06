export interface GoogleServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

export type DataRealm = 'crm' | 'timetracking' | 'accounting'; // add others as needed
export type DataSource = 'hubspot' | 'harvest' | 'xero'; // add others as needed

export const getRealm = (realm: string): DataRealm => {
  switch (realm) {
    case 'crm':
      return 'crm';
    case 'timetracking':
      return 'timetracking';
    case 'accounting':
      return 'accounting';
  }

  throw new Error(`Unknown realm: ${realm}`);
};

export const getSource = (source: unknown): DataSource => {
  switch (source) {
    case 'hubspot':
      return 'hubspot';
    case 'harvest':
      return 'harvest';
    case 'xero':
      return 'xero';
  }
  throw new Error(`Unknown source: ${source}`);
};
