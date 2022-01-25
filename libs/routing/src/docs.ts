import { route, stringParser } from 'typesafe-routes';

const page = route('/:name', { name: stringParser }, {});

export default route('/docs', {}, { page });
