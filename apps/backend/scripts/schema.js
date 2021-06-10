const {
  ApolloServer,
  gql,
  makeExecutableSchema,
} = require('apollo-server-lambda');
const { graphqlSync, getIntrospectionQuery, printSchema } = require('graphql');

const schema = require('../src/shared/graphql/schema')({ gql, makeExecutableSchema });

//const result = graphqlSync(schema, getIntrospectionQuery()).data;
const result = printSchema(schema);

console.log(result);

// const clientSchema = buildClientSchema(schema);
// console.log(JSON.stringify(clientSchema, null, '\t'));
