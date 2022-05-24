import React from 'react';
import { Redirect } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Config = require('../../docusaurus.config');

export default function Home() {
  const redirectPath = `/docs/${Config.themeConfig.navbar.items[0].docId}`;
  return <Redirect to={redirectPath} />;
}
