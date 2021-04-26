'use strict';

const assert = require('assert');
const Encoder = require('kafkajs/src/protocol/encoder');
const Decoder = require('kafkajs/src/protocol/decoder');
const errorCodes = require('./error-codes');
const createRequestQueue = require('./request-queue');

function createConnHandler(log, conf, groupManager) {
  return (socket) => {
    const requestQueue = createRequestQueue();
    const authHandlers = null;
    let chunks = [];
    let bytesBuffered = 0;
    let bytesNeeded = Decoder.int32Size();

    function processData(chunk) {
      chunks.push(chunk);
      bytesBuffered += Buffer.byteLength(chunk);

      while (bytesNeeded <= bytesBuffered) {
        const buffer = chunks.length > 1 ? Buffer.concat(chunks) : chunks[0];
        const decoder = new Decoder(buffer);
        const expectedRequestSize = decoder.readInt32();

        // Return early if not enough bytes to read the full request
        if (!decoder.canReadBytes(expectedRequestSize)) {
          chunks = [buffer];
          bytesBuffered = Buffer.byteLength(buffer);
          bytesNeeded = Decoder.int32Size() + expectedRequestSize;
          return;
        }

        const request = new Decoder(decoder.readBytes(expectedRequestSize));

        // Reset the buffered chunks as the rest of the bytes
        const remainderBuffer = decoder.readAll();
        chunks = [remainderBuffer];
        bytesBuffered = Buffer.byteLength(remainderBuffer);
        bytesNeeded = Decoder.int32Size();

        if (authHandlers) {
          const rawRequestSize = Decoder.int32Size() + expectedRequestSize;
          const rawRequestBuffer = buffer.slice(0, rawRequestSize);
          return authHandlers.onSuccess(rawRequestBuffer);
        }

        // const payload = request.readAll()

        const req = {
          size: expectedRequestSize,
          apiKey: request.readInt16(),
          apiVersion: request.readInt16(),
          correlationId: request.readInt32(),
          clientId: request.readString(),
          payload: request.readAll(),
          socket,
          log,
          conf,
          groupManager,
          error: (errorCode) => handleError(req, errorCode),
          reply: (buffer) => reply(req, buffer),
          replied: false,
        };

        requestQueue.push(req);
      }
    }

    socket.on('data', processData);
  };
}

async function handleError(req, error) {
  console.trace('Replying with error to request', {
    apiKey: req.apiKey,
    apiVersion: req.apiVersion,
    correlationId: req.correlationId,
    error,
  });
  if (req.replied) {
    console.error(
      'handling error. had already replied to request. Error: ',
      error
    );
    return;
  }
  let errorCode;
  if (typeof error === 'number') {
    errorCode = error;
  } else {
    console.error(error);
    errorCode = error.code || errorCodes.UNKNOWN;
  }
  const encoder = new Encoder();
  encoder.writeInt32(2); // 2 bytes length
  encoder.writeInt16(errorCode);
  req.socket.end(encoder.buffer);
}

async function reply(req, buffer) {
  assert(!req.replied, 'cannot reply to already replied request');
  const size = buffer.length + 4; // correlationId
  const enc = new Encoder(size + 4);
  enc.writeInt32(size);
  enc.writeInt32(req.correlationId);
  enc.writeBufferInternal(buffer);
  req.socket.write(enc.buffer);
  req.replied = true;
}

module.exports = createConnHandler;
