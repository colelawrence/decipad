import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './libs/graphqlserver/**/typedefs.graphql',
  generates: {
    'libs/graphqlserver-types/src/generated/graphql-types.ts': {
      plugins: [
        'typescript',
        'typescript-resolvers',
        {
          add: {
            content: '// @ts-nocheck',
          },
        },
      ],
      config: {
        scalars: {
          ID: {
            input: 'string',
            output: 'string',
          },
        },
        contextType: './context#GraphqlContext',
        enumsAsTypes: true,
        maybeValue:
          'T extends PromiseLike<infer U> ? Promise<U | null | undefined> : T | undefined',
      },
    },
  },
};
export default config;
