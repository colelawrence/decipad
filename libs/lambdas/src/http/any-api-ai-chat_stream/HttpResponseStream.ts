const isAWSLambda = typeof awslambda !== 'undefined';

export const HttpResponseStream = {
  from(stream: any, metadata: any): any {
    if (isAWSLambda) {
      return awslambda.HttpResponseStream.from(stream, metadata);
    }
    return stream;
  },
};
