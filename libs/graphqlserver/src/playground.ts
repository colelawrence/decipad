export default {
  settings: {
    'request.credentials': 'include',
    'schema.polling.enable': false,
    'schema.polling.interval': 60000,
  },
  endpoint: 'http://localhost:3333/graphql',
  subscriptionEndpoint: 'ws://localhost:3333/graphql',
};
