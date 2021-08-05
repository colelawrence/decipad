export default {
  Pageable: {
    // eslint-disable-next-line no-underscore-dangle
    __resolveType(obj: { gqlType: unknown }) {
      return obj.gqlType;
    },
  },
};
