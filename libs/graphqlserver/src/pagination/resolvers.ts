export default {
  Pageable: {
    __resolveType(obj: any) {
      return obj.gqlType;
    },
  },
};
