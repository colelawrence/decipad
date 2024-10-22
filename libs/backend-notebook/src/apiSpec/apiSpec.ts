import { z } from 'zod';
import { createDocument, extendZodWithOpenApi } from 'zod-openapi';
import { pathsSpec } from './pathsSpec';

extendZodWithOpenApi(z);

export const apiSpec = (domain: string): ReturnType<typeof createDocument> =>
  createDocument({
    openapi: '3.1.0',
    info: {
      title: 'Create and modify a Decipad notebook',
      description: `Create and modify a Decipad notebook where you can build a numerical model, adding and manipulating text, tables, data views, sliders.
Column names and variable names must not have spaces or weird characters in them.`,
      version: 'v1',
    },
    servers: [
      {
        url: domain,
      },
    ],
    paths: pathsSpec(),
    components: {
      schemas: {
        CreateResult: {
          type: 'object',
          properties: {
            createdElementId: {
              type: 'string',
            },
            createdElementType: {
              type: 'string',
            },
            createdElementName: {
              type: 'string',
            },
          },
        },
        CreateResults: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/CreateResult',
          },
        },
        AnyElement: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            type: {
              type: 'string',
            },
            children: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
      },
    },
  });
