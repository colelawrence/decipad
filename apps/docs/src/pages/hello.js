import React from 'react';
import Layout from '@theme/Layout';

import { DocSearch } from '@docsearch/react';

import '@docsearch/css';

export default function Hello() {
  return (
    <Layout title="Hello" description="Hello React Page">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '20px',
        }}
      >
        <p>
          <DocSearch
            appId="YOUR_APP_ID"
            indexName="YOUR_INDEX_NAME"
            apiKey="YOUR_SEARCH_API_KEY"
          />
        </p>
      </div>
    </Layout>
  );
}
