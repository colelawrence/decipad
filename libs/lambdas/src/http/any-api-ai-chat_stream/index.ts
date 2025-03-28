/* eslint-disable camelcase */
import { streamifyResponse } from 'lambda-stream';
import { CoreMessage, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getDefined } from '@decipad/utils';
import { enhanceResponseStream } from './enhanceResponseStream';
import { badRequest, notFound } from '@hapi/boom';
import { HttpResponseStream } from './HttpResponseStream';

const providers = {
  openai: () =>
    createOpenAI({
      apiKey: getDefined(
        process.env.OPENAI_API_KEY,
        'OPENAI_API_KEY is not defined'
      ),
    }),
};

// Declare awslambda as a global object
declare global {
  const awslambda: {
    HttpResponseStream: {
      from(stream: any, metadata: any): any;
    };
  };
}

export const handler = streamifyResponse(async (event, responseStream) => {
  const httpResponseMetadata = {
    statusCode: 200,
    statusMessage: 'OK',
    headers: {},
  };

  responseStream = HttpResponseStream.from(
    responseStream,
    httpResponseMetadata
  );

  try {
    // get provider
    const providerName = event.queryStringParameters?.provider;
    const providerConstructor =
      providers[providerName as keyof typeof providers];
    if (!providerConstructor) {
      throw notFound(`Provider ${providerName} not found`);
    }

    // get model
    const model = event.queryStringParameters?.model;
    if (!model) {
      throw badRequest('Invalid request: model parameter is required');
    }

    // get messages
    let messages: Array<CoreMessage> = [];
    if (event.body) {
      const body = JSON.parse(
        event.isBase64Encoded
          ? Buffer.from(event.body, 'base64').toString()
          : event.body
      );
      if (body.messages) {
        messages = body.messages;
      }
    }

    const provider = providerConstructor();

    const result = streamText({
      model: provider(model),
      messages,
      onError: ({ error }) => {
        console.error(error);
        responseStream.write(`3:${JSON.stringify(error)}\n`);
        responseStream.end();
      },
    });

    // pipe result to response stream
    result.pipeDataStreamToResponse(
      enhanceResponseStream(responseStream, httpResponseMetadata)
    );
  } catch (error) {
    console.error(error);
    httpResponseMetadata.statusCode = 500;
    httpResponseMetadata.statusMessage = 'Internal Server Error';
    responseStream.write(`3:${JSON.stringify((error as Error).message)}\n`);
    responseStream.end();
  }
});
