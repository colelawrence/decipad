export default {
  settings: {
    'request.credentials': 'include',
    'schema.polling.enable': false,
    'schema.polling.interval': 60000,
  },
  subscriptionEndpoint: 'ws://localhost:3333/graphql',
};
