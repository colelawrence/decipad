// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// fetch-polyfill.js
import fetch, {
  Blob,
  blobFrom,
  blobFromSync,
  File,
  fileFrom,
  fileFromSync,
  FormData,
  Headers,
  Request,
  Response,
} from 'node-fetch';

if (!global.fetch) {
  global.fetch = fetch;
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
  global.Blob = Blob;
  global.blobFrom = blobFrom;
  global.blobFromSync = blobFromSync;
  global.File = File;
  global.fileFrom = fileFrom;
  global.fileFromSync = fileFromSync;
  global.FormData = FormData;
}
