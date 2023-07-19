import Layout from '@theme/Layout';
import React from 'react';

import { DocSearch } from '@docsearch/react';
import { Card, GridContainer } from '@site/src/components/GalleryCards';

import '@docsearch/css';

export default function Hello() {
  return (
    <Layout title="Hello" description="Hello React Page">
      <div
        style={{
          maxWidth: '1000px',
          margin: 'auto',
          paddingBottom: '100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            fontSize: '20px',
            backgroundColor: '#f7f7f7',
            padding: '40px',
            margin: '100px',
            marginTop: '50px',
            borderRadius: '16px',
          }}
        >
          <h1>Decipad Help Center </h1>
          <p>
            <DocSearch
              appId="YOUR_APP_ID"
              indexName="YOUR_INDEX_NAME"
              apiKey="YOUR_SEARCH_API_KEY"
            />
          </p>
        </div>
        <h1>Videos </h1>

        <GridContainer>
          <Card
            img2="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
            title="Get started with Decipad"
            notebook="/docs/quick-start/notebooks#video-create-your-first-notebook"
            description="Decipad is a smart document where you can create and explain calculations, empowering you to make better decisions with numbers."
          />
          <Card
            img2="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
            title="Create Tables on Decipad"
            notebook="/docs/quick-start/tables"
            description="Tables help you organize your numbers and create quick calculations."
          />
        </GridContainer>

        <br />

        <h2>Guides</h2>

        <GridContainer>
          <Card
            title="Begginer's guide"
            notebook="mailto:support@decipad.com"
            description="Email support@decipad.com with any questions and suggestions you may have."
          />
          <Card
            title="Join our community"
            notebook="https://discord.gg/CUtKEd3rBn"
            description="Get a closer look behind the scenes by joining our Discord channel, where the team is always a click away."
          />
          <Card
            title="Begginer's guide"
            notebook="mailto:support@decipad.com"
            description="Email support@decipad.com with any questions and suggestions you may have."
          />
          <Card
            title="Join our community"
            notebook="https://discord.gg/CUtKEd3rBn"
            description="Get a closer look behind the scenes by joining our Discord channel, where the team is always a click away."
          />
        </GridContainer>

        <br />

        <h2>Browse by category</h2>

        <h2>Popular Articles</h2>

        <h2>Recent Releases</h2>
      </div>
    </Layout>
  );
}
