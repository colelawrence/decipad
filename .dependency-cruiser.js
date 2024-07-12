module.exports = {
  // TODO: Urgently uncomment this as we have 264 dependencies cruised all over the project
  // forbidden: [
  //   {
  //     name: 'no-circular',
  //     comment: 'This dependency is part of a circular relationship',
  //     severity: 'error',
  //     from: {},
  //     to: {
  //       circular: true,
  //     },
  //   },
  // ],
  options: {
    exclude: {
      path: 'node_modules',
    },
  },
};
