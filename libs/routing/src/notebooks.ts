import { route, stringParser } from 'typesafe-routes';

// TODO secret query string
// TODO vanity url parser
const notebook = route('/:notebookId', { notebookId: stringParser }, {});

export default route('/n', {}, { notebook });
